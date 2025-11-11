<!-- Backend Modernization Plan for MedSource Pro -->
# MedSource Pro Backend Modernization Plan

## Project Analysis

### Current State (MedSource Pro Backend)

- **Framework**: ASP.NET Core 8.0 (Web API)
- **Database**: PostgreSQL (Npgsql.EntityFrameworkCore.PostgreSQL 8.0.4)
- **ORM**: Entity Framework Core 8.0.7
- **Authentication**: JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 8.0.7)
- **Password Hashing**: BCrypt.Net-Next 4.0.3
- **Email Service**: SendGrid 9.29.3
- **File Storage**: Azure Blob Storage 12.21.1
- **PDF Generation**: iText7 8.0.5
- **API Documentation**: Swagger/OpenAPI (Swashbuckle.AspNetCore 6.6.2)
- **Architecture**: Traditional 3-layer (Controllers → Services → Database)
- **Project Structure**: Entities, Services, Controllers, Classes (DTOs), Helpers
- **Migrations**: 71 migration files (significant history)

### Critical Security Issues Identified

⚠️ **IMMEDIATE SECURITY CONCERNS**:
1. **Hardcoded JWT Secret** in `Program.cs` (line 54) and `Account.cs` (line 104)
2. **Hardcoded Database Connection String** in `Program.cs` (line 26) with credentials visible
3. **Hardcoded API Keys** in `launchSettings.json` (SendGrid, Azure Storage)
4. **Overly Permissive CORS** - `AllowAnyOrigin()` in production
5. **HTTPS Requirement Disabled** - `RequireHttpsMetadata = false` (line 48)

### Architecture Issues

1. **No DTOs/ViewModels**: Entities exposed directly to clients
2. **No API Versioning**: Breaking changes would affect all clients
3. **Inconsistent Error Handling**: Manual error responses in controllers
4. **Missing Middleware**: Empty `Middleware/` folder
5. **No Repository Pattern**: Services directly access DbContext
6. **No Unit of Work**: Multiple SaveChanges calls, no transaction management
7. **Mixed Concerns**: Business logic in entities (JWT creation in `Account.cs`)
8. **No Proper Logging**: Commented out logging configuration
9. **No Health Checks**: No /health endpoint for monitoring
10. **No Request Validation**: Minimal validation on DTOs

### Code Quality Issues

1. **Inconsistent Naming**: `prod_server` (namespace) vs `prod-server` (project)
2. **TODOs in Production Code**: Line 20 in `Program.cs`
3. **Duplicate Code**: Similar update methods in Account entity
4. **Magic Numbers**: Enum values (Admin = 9999999)
5. **No Null Handling Strategy**: Mix of nullable and required fields
6. **Commented Code**: Dead code in Program.cs (CORS, logging)

### Testing & DevOps Gaps

1. **No Unit Tests**: No test projects
2. **No Integration Tests**: No API tests
3. **No CI/CD**: No GitHub Actions, Azure Pipelines, etc.
4. **No Docker Support**: No Dockerfile or docker-compose
5. **No Environment Configuration**: Hardcoded values instead of appsettings per environment

### Target State (Industry Best Practices)

- **Security**: All secrets in Azure Key Vault / User Secrets
- **Architecture**: Clean Architecture with CQRS pattern (MediatR)
- **API**: Versioned, documented, RESTful APIs with DTOs
- **Error Handling**: Global exception middleware with consistent responses
- **Validation**: FluentValidation for all requests
- **Logging**: Serilog with structured logging
- **Caching**: Redis for distributed caching
- **Health Checks**: Custom health checks for database, external services
- **Testing**: 80%+ code coverage with unit and integration tests
- **DevOps**: Dockerized, CI/CD pipelines, automated deployments
- **Monitoring**: Application Insights for telemetry
- **Documentation**: OpenAPI 3.0, XML documentation on all endpoints

---

## Phase 1: Critical Security Fixes (URGENT)

### 1.1 Move Secrets to User Secrets / Environment Variables

**Priority**: 🔴 CRITICAL - Do this FIRST before any other changes

**Files to update**: `Program.cs`, `Account.cs`, `appsettings.json`, `.gitignore`

**Steps**:

1. **Initialize User Secrets**:
```bash
cd server
dotnet user-secrets init
```

2. **Store secrets safely**:
```bash
dotnet user-secrets set "JwtSettings:SecretKey" "YOUR_NEW_SECRET_KEY_HERE"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
dotnet user-secrets set "SendGrid:ApiKey" "YOUR_SENDGRID_KEY"
dotnet user-secrets set "AzureStorage:ConnectionString" "YOUR_AZURE_KEY"
dotnet user-secrets set "AzureStorage:ContainerName" "medsource"
```

3. **Update appsettings.json** (placeholders only):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "JwtSettings": {
    "SecretKey": "",
    "Issuer": "MedSourcePro",
    "Audience": "MedSourceProClient",
    "ExpirationInDays": 1,
    "RememberMeExpirationInDays": 30
  },
  "SendGrid": {
    "ApiKey": "",
    "FromEmail": "noreply@medsourcepro.com",
    "FromName": "MedSource Pro"
  },
  "AzureStorage": {
    "ConnectionString": "",
    "ContainerName": ""
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

4. **Update Program.cs** to read from configuration:
```csharp
// REMOVE hardcoded connection string (lines 26-38)
// REPLACE WITH:
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<Context>(options =>
{
    var connectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
        Pooling = true,
        MaxPoolSize = 20, // Increase from 5 for better performance
        MinPoolSize = 2,
        ConnectionIdleLifetime = 300,
        ConnectionLifetime = 600
    };
    options.UseNpgsql(connectionStringBuilder.ConnectionString, o => 
    {
        o.EnableRetryOnFailure(3);
        o.CommandTimeout(30);
    });
});

// REMOVE hardcoded JWT key (line 54)
// REPLACE WITH:
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] 
    ?? throw new InvalidOperationException("JWT Secret Key not found.");

options.TokenValidationParameters = new TokenValidationParameters
{
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtSettings["Issuer"],
    ValidAudience = jwtSettings["Audience"],
    ClockSkew = TimeSpan.Zero // Remove default 5 min tolerance
};
```

5. **Create JwtService** to centralize JWT logic:
```csharp
// Services/JwtService.cs
public interface IJwtService
{
    string GenerateToken(Account account, bool rememberMe = false);
    ClaimsPrincipal? ValidateToken(string token);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    
    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public string GenerateToken(Account account, bool rememberMe = false)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var expirationDays = rememberMe 
            ? int.Parse(jwtSettings["RememberMeExpirationInDays"]) 
            : int.Parse(jwtSettings["ExpirationInDays"]);
            
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Name, account.Username),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Role, account.Role.ToString())
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expirationDays),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

6. **Remove JWT creation from Account.cs**:
- Delete `CreateJwtToken()` method (lines 97-115)
- Update AccountController to use IJwtService instead

7. **Update .gitignore**:
```gitignore
# User secrets
**/appsettings.Development.json
**/appsettings.Production.json
**/launchSettings.json

# Environment files
.env
.env.*
!.env.example
```

8. **Enable HTTPS requirement**:
```csharp
// Program.cs - line 48
options.RequireHttpsMetadata = true; // CHANGE to true for production
```

### 1.2 Fix CORS Configuration

**Files to update**: `Program.cs`

**Replace** (lines 132-146):
```csharp
app.UseCors(builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
});
```

**With**:
```csharp
// Add CORS policy in builder.Services section
var corsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("MedSourceProPolicy", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

// In app configuration
app.UseCors("MedSourceProPolicy");
```

**Add to appsettings.json**:
```json
{
  "CorsOrigins": [
    "http://localhost:3000",
    "https://medsourcepro.com",
    "https://www.medsourcepro.com"
  ]
}
```

---

## Phase 2: Clean Architecture Restructure

### 2.1 Project Structure (Clean Architecture)

**Create new project structure**:
```
MedSourcePro.sln
├── src/
│   ├── MedSourcePro.Domain/          # Enterprise business rules
│   │   ├── Entities/                 # Domain entities
│   │   ├── Enums/                    # Domain enums
│   │   ├── Events/                   # Domain events
│   │   ├── Exceptions/               # Domain exceptions
│   │   └── ValueObjects/             # Value objects (Name, Address, etc.)
│   │
│   ├── MedSourcePro.Application/     # Application business rules
│   │   ├── Common/
│   │   │   ├── Interfaces/           # IApplicationDbContext, etc.
│   │   │   ├── Models/               # Result, PaginatedList, etc.
│   │   │   └── Exceptions/           # Application exceptions
│   │   ├── Accounts/
│   │   │   ├── Commands/             # CreateAccount, UpdateAccount, etc.
│   │   │   ├── Queries/              # GetAccountById, SearchAccounts, etc.
│   │   │   └── DTOs/                 # AccountDto, AccountDetailDto, etc.
│   │   ├── Orders/
│   │   │   ├── Commands/
│   │   │   ├── Queries/
│   │   │   └── DTOs/
│   │   └── [Other Features]/
│   │
│   ├── MedSourcePro.Infrastructure/  # External concerns
│   │   ├── Persistence/
│   │   │   ├── Context.cs
│   │   │   ├── Configurations/       # Entity configurations
│   │   │   └── Migrations/
│   │   ├── Identity/                 # JWT, authentication services
│   │   ├── Services/                 # Email, Storage, PDF services
│   │   └── DependencyInjection.cs
│   │
│   └── MedSourcePro.API/             # Presentation layer
│       ├── Controllers/
│       ├── Middleware/
│       ├── Filters/
│       ├── Extensions/
│       └── Program.cs
│
└── tests/
    ├── MedSourcePro.Domain.Tests/
    ├── MedSourcePro.Application.Tests/
    ├── MedSourcePro.Infrastructure.Tests/
    └── MedSourcePro.API.IntegrationTests/
```

**Rationale**:
- Clear separation of concerns
- Dependency rule: Inner layers don't depend on outer layers
- Domain layer has no external dependencies
- Application layer orchestrates business logic
- Infrastructure layer handles external concerns
- API layer is thin, just presentation

### 2.2 Install CQRS Pattern (MediatR)

**Add NuGet packages**:
```bash
dotnet add MedSourcePro.Application package MediatR
dotnet add MedSourcePro.Application package MediatR.Extensions.Microsoft.DependencyInjection
dotnet add MedSourcePro.Application package FluentValidation
dotnet add MedSourcePro.Application package FluentValidation.DependencyInjectionExtensions
dotnet add MedSourcePro.Application package AutoMapper
dotnet add MedSourcePro.Application package AutoMapper.Extensions.Microsoft.DependencyInjection
```

**Example Command** (Create Account):
```csharp
// Application/Accounts/Commands/CreateAccount/CreateAccountCommand.cs
public record CreateAccountCommand : IRequest<Result<AccountDto>>
{
    public string Username { get; init; }
    public string Email { get; init; }
    public string Password { get; init; }
    public Name Name { get; init; }
    public DateTime? DateOfBirth { get; init; }
}

// Application/Accounts/Commands/CreateAccount/CreateAccountCommandHandler.cs
public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<AccountDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public CreateAccountCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IMapper mapper)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<Result<AccountDto>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        // Check if username exists
        if (await _context.Accounts.AnyAsync(a => a.Username == request.Username, cancellationToken))
        {
            return Result<AccountDto>.Failure("Username already exists");
        }

        // Check if email exists
        if (await _context.Accounts.AnyAsync(a => a.Email == request.Email, cancellationToken))
        {
            return Result<AccountDto>.Failure("Email already exists");
        }

        var account = new Account
        {
            Username = request.Username,
            Email = request.Email,
            Password = _passwordHasher.HashPassword(request.Password),
            Name = request.Name,
            DateOfBirth = request.DateOfBirth,
            Role = AccountRole.Customer
        };

        if (account.Role == AccountRole.Customer)
        {
            account.Customer = new Customer
            {
                Name = $"{account.Name.First} {account.Name.Last}",
                Email = account.Email
            };
        }

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);

        var accountDto = _mapper.Map<AccountDto>(account);
        return Result<AccountDto>.Success(accountDto);
    }
}

// Application/Accounts/Commands/CreateAccount/CreateAccountCommandValidator.cs
public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(v => v.Username)
            .NotEmpty().WithMessage("Username is required")
            .MaximumLength(50).WithMessage("Username must not exceed 50 characters")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores");

        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email is not valid")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");

        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required");

        RuleFor(v => v.Name.First)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters");

        RuleFor(v => v.Name.Last)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters");
    }
}
```

**Example Query** (Get Account by ID):
```csharp
// Application/Accounts/Queries/GetAccountById/GetAccountByIdQuery.cs
public record GetAccountByIdQuery(int Id) : IRequest<Result<AccountDetailDto>>;

// Application/Accounts/Queries/GetAccountById/GetAccountByIdQueryHandler.cs
public class GetAccountByIdQueryHandler : IRequestHandler<GetAccountByIdQuery, Result<AccountDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAccountByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AccountDetailDto>> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .Include(a => a.Customer)
            .Include(a => a.Notifications)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (account == null)
        {
            return Result<AccountDetailDto>.Failure("Account not found");
        }

        var dto = _mapper.Map<AccountDetailDto>(account);
        return Result<AccountDetailDto>.Success(dto);
    }
}
```

**Controller becomes thin**:
```csharp
// API/Controllers/AccountsController.cs
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly ISender _mediator;

    public AccountsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateAccountCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _mediator.Send(new GetAccountByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }
}
```

### 2.3 Implement DTOs (Data Transfer Objects)

**Create DTOs for all entities**:
```csharp
// Application/Accounts/DTOs/AccountDto.cs
public record AccountDto
{
    public int Id { get; init; }
    public string Username { get; init; }
    public string Email { get; init; }
    public NameDto Name { get; init; }
    public DateTime CreatedAt { get; init; }
    public AccountRole Role { get; init; }
}

// Application/Accounts/DTOs/AccountDetailDto.cs
public record AccountDetailDto : AccountDto
{
    public Address ShippingDetails { get; init; }
    public string Phone { get; init; }
    public string Mobile { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public CustomerDto Customer { get; init; }
    public List<NotificationDto> Notifications { get; init; }
}

// Application/Accounts/DTOs/LoginResponseDto.cs
public record LoginResponseDto
{
    public string Token { get; init; }
    public DateTime ExpiresAt { get; init; }
    public AccountDto Account { get; init; }
}

// Application/Common/Models/Result.cs
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public bool IsFailure => !IsSuccess;
    public T Value { get; private set; }
    public string Error { get; private set; }

    protected Result(bool isSuccess, T value, string error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}
```

**AutoMapper profiles**:
```csharp
// Application/Accounts/MappingProfiles/AccountMappingProfile.cs
public class AccountMappingProfile : Profile
{
    public AccountMappingProfile()
    {
        CreateMap<Account, AccountDto>();
        CreateMap<Account, AccountDetailDto>();
        CreateMap<Name, NameDto>();
        CreateMap<Customer, CustomerDto>();
        CreateMap<Notification, NotificationDto>();
    }
}
```

---

## Phase 3: API Improvements

### 3.1 Implement API Versioning

**Add NuGet package**:
```bash
dotnet add MedSourcePro.API package Asp.Versioning.Mvc
dotnet add MedSourcePro.API package Asp.Versioning.Mvc.ApiExplorer
```

**Configure in Program.cs**:
```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version")
    );
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});
```

**Update Swagger configuration**:
```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "MedSource Pro API", 
        Version = "v1",
        Description = "Medical B2B Marketplace API",
        Contact = new OpenApiContact
        {
            Name = "MedSource Pro Support",
            Email = "support@medsourcepro.com"
        }
    });

    // JWT Authentication
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // XML Documentation
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});
```

### 3.2 Global Exception Handling Middleware

**Create middleware**:
```csharp
// API/Middleware/ExceptionHandlingMiddleware.cs
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            ValidationException validationEx => (StatusCodes.Status400BadRequest, 
                string.Join(", ", validationEx.Errors.Select(e => e.ErrorMessage))),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            NotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred processing your request")
        };

        context.Response.StatusCode = statusCode;

        var response = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitle(statusCode),
            Detail = message,
            Instance = context.Request.Path
        };

        // Include stack trace in development
        if (_environment.IsDevelopment())
        {
            response.Extensions["stackTrace"] = exception.StackTrace;
        }

        await context.Response.WriteAsJsonAsync(response);
    }

    private static string GetTitle(int statusCode) => statusCode switch
    {
        StatusCodes.Status400BadRequest => "Bad Request",
        StatusCodes.Status401Unauthorized => "Unauthorized",
        StatusCodes.Status404NotFound => "Not Found",
        StatusCodes.Status500InternalServerError => "Internal Server Error",
        _ => "Error"
    };
}
```

**Register middleware in Program.cs**:
```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>();
```

### 3.3 Request Validation Pipeline

**FluentValidation behavior**:
```csharp
// Application/Common/Behaviors/ValidationBehavior.cs
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Any())
        {
            throw new ValidationException(failures);
        }

        return await next();
    }
}
```

**Register in Application layer**:
```csharp
// Application/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }
}
```

### 3.4 Structured Logging (Serilog)

**Add NuGet packages**:
```bash
dotnet add MedSourcePro.API package Serilog.AspNetCore
dotnet add MedSourcePro.API package Serilog.Sinks.Console
dotnet add MedSourcePro.API package Serilog.Sinks.File
dotnet add MedSourcePro.API package Serilog.Sinks.Seq
dotnet add MedSourcePro.API package Serilog.Enrichers.Environment
dotnet add MedSourcePro.API package Serilog.Enrichers.Thread
```

**Configure Serilog in Program.cs**:
```csharp
// At the top of Program.cs
using Serilog;

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/medsourcepro-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Seq("http://localhost:5341") // Optional: Seq for log aggregation
    .CreateLogger();

try
{
    Log.Information("Starting MedSource Pro API");
    
    var builder = WebApplication.CreateBuilder(args);
    
    // Replace default logging with Serilog
    builder.Host.UseSerilog();
    
    // ... rest of configuration
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

**Add to appsettings.json**:
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

---

## Phase 4: Performance & Caching

### 4.1 Response Caching & Redis

**Add NuGet packages**:
```bash
dotnet add MedSourcePro.Infrastructure package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add MedSourcePro.API package AspNetCore.ResponseCaching.Extensions
```

**Configure Redis**:
```csharp
// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MedSourcePro_";
});

builder.Services.AddResponseCaching();
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Cache());
    options.AddPolicy("Products", builder => 
        builder.Cache()
               .Expire(TimeSpan.FromMinutes(10))
               .Tag("products"));
});
```

**Usage in controllers**:
```csharp
[HttpGet]
[ResponseCache(Duration = 300)] // 5 minutes
[OutputCache(PolicyName = "Products")]
public async Task<IActionResult> GetProducts()
{
    // ...
}
```

### 4.2 Database Query Optimization

**Create indexes**:
```csharp
// Infrastructure/Persistence/Configurations/AccountConfiguration.cs
public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);
        
        // Indexes for frequently queried fields
        builder.HasIndex(a => a.Username).IsUnique();
        builder.HasIndex(a => a.Email).IsUnique();
        builder.HasIndex(a => a.CustomerId);
        builder.HasIndex(a => new { a.Email, a.Username }); // Composite index
        
        // Value objects
        builder.OwnsOne(a => a.Name);
        builder.OwnsOne(a => a.ShippingDetails);
        
        // Relationships
        builder.HasOne(a => a.Customer)
               .WithMany(c => c.Accounts)
               .HasForeignKey(a => a.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);
        
        // Exclude password from queries by default
        builder.Ignore(a => a.Password);
    }
}
```

**Use compiled queries for frequently-used queries**:
```csharp
// Application/Accounts/Queries/Common/CompiledQueries.cs
public static class AccountQueries
{
    public static readonly Func<Context, string, Task<Account?>> GetByUsername =
        EF.CompileAsyncQuery((Context context, string username) =>
            context.Accounts.FirstOrDefault(a => a.Username == username));

    public static readonly Func<Context, string, Task<Account?>> GetByEmail =
        EF.CompileAsyncQuery((Context context, string email) =>
            context.Accounts.FirstOrDefault(a => a.Email == email));
}
```

### 4.3 Implement Repository Pattern (Optional)

**Generic repository interface**:
```csharp
// Application/Common/Interfaces/IRepository.cs
public interface IRepository<TEntity> where TEntity : class
{
    Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default);
    IQueryable<TEntity> Query();
}

// Infrastructure/Persistence/Repositories/Repository.cs
public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly Context _context;
    protected readonly DbSet<TEntity> _dbSet;

    public Repository(Context context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    public virtual async Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public virtual Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public virtual Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public virtual IQueryable<TEntity> Query()
    {
        return _dbSet.AsQueryable();
    }
}
```

---

## Phase 5: Health Checks & Monitoring

### 5.1 Implement Health Checks

**Add NuGet packages**:
```bash
dotnet add MedSourcePro.API package AspNetCore.HealthChecks.UI.Client
dotnet add MedSourcePro.API package AspNetCore.HealthChecks.Npgsql
dotnet add MedSourcePro.API package AspNetCore.HealthChecks.Redis
dotnet add MedSourcePro.API package AspNetCore.HealthChecks.AzureBlobStorage
```

**Configure health checks**:
```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        name: "database",
        tags: new[] { "db", "postgres" })
    .AddRedis(
        builder.Configuration.GetConnectionString("Redis"),
        name: "redis",
        tags: new[] { "cache", "redis" })
    .AddAzureBlobStorage(
        builder.Configuration["AzureStorage:ConnectionString"],
        name: "blob-storage",
        tags: new[] { "storage", "azure" })
    .AddCheck<EmailServiceHealthCheck>("email-service", tags: new[] { "email" });

// Map health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

**Custom health check**:
```csharp
// API/HealthChecks/EmailServiceHealthCheck.cs
public class EmailServiceHealthCheck : IHealthCheck
{
    private readonly IEmailService _emailService;

    public EmailServiceHealthCheck(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var isHealthy = await _emailService.CheckConnectionAsync(cancellationToken);
            
            return isHealthy
                ? HealthCheckResult.Healthy("Email service is responding")
                : HealthCheckResult.Degraded("Email service is slow or unreachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Email service is unavailable", ex);
        }
    }
}
```

### 5.2 Application Insights (Azure Monitoring)

**Add NuGet package**:
```bash
dotnet add MedSourcePro.API package Microsoft.ApplicationInsights.AspNetCore
```

**Configure**:
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

**Add to appsettings.json**:
```json
{
  "ApplicationInsights": {
    "ConnectionString": ""
  }
}
```

---

## Phase 6: Testing Infrastructure

### 6.1 Unit Tests

**Create test project**:
```bash
dotnet new xunit -n MedSourcePro.Application.Tests
dotnet add MedSourcePro.Application.Tests reference MedSourcePro.Application
dotnet add MedSourcePro.Application.Tests package FluentAssertions
dotnet add MedSourcePro.Application.Tests package Moq
dotnet add MedSourcePro.Application.Tests package AutoFixture
```

**Example unit test**:
```csharp
// Tests/Application.Tests/Accounts/Commands/CreateAccountCommandHandlerTests.cs
public class CreateAccountCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CreateAccountCommandHandler _handler;

    public CreateAccountCommandHandlerTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _mapperMock = new Mock<IMapper>();
        _handler = new CreateAccountCommandHandler(
            _contextMock.Object,
            _passwordHasherMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_WithUniqueUsername_ShouldCreateAccount()
    {
        // Arrange
        var command = new CreateAccountCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123!",
            Name = new Name { First = "Test", Last = "User" }
        };

        _contextMock.Setup(x => x.Accounts.AnyAsync(
            It.IsAny<Expression<Func<Account, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _passwordHasherMock.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashedpassword");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _contextMock.Verify(x => x.Accounts.Add(It.IsAny<Account>()), Times.Once);
        _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithExistingUsername_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateAccountCommand
        {
            Username = "existinguser",
            Email = "test@example.com",
            Password = "Password123!"
        };

        _contextMock.Setup(x => x.Accounts.AnyAsync(
            It.Is<Expression<Func<Account, bool>>>(expr => 
                expr.Compile()(new Account { Username = "existinguser" })),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Username already exists");
        _contextMock.Verify(x => x.Accounts.Add(It.IsAny<Account>()), Times.Never);
    }
}
```

### 6.2 Integration Tests

**Create integration test project**:
```bash
dotnet new xunit -n MedSourcePro.API.IntegrationTests
dotnet add MedSourcePro.API.IntegrationTests reference MedSourcePro.API
dotnet add MedSourcePro.API.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add MedSourcePro.API.IntegrationTests package Testcontainers.PostgreSql
```

**Example integration test**:
```csharp
// Tests/API.IntegrationTests/Controllers/AccountsControllerTests.cs
public class AccountsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public AccountsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateAccount_WithValidData_ReturnsCreated()
    {
        // Arrange
        var command = new CreateAccountCommand
        {
            Username = "integrationtest",
            Email = "integration@test.com",
            Password = "Password123!",
            Name = new Name { First = "Integration", Last = "Test" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/accounts", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var account = await response.Content.ReadFromJsonAsync<AccountDto>();
        account.Should().NotBeNull();
        account.Username.Should().Be("integrationtest");
    }
}

// Custom test factory with test database
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:15")
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove production DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<Context>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Add test database
            services.AddDbContext<Context>(options =>
            {
                options.UseNpgsql(_dbContainer.GetConnectionString());
            });
        });
    }

    public override async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        await base.InitializeAsync();
    }

    public override async Task DisposeAsync()
    {
        await _dbContainer.StopAsync();
        await base.DisposeAsync();
    }
}
```

---

## Phase 7: DevOps & Deployment

### 7.1 Dockerization

**Create Dockerfile**:
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/MedSourcePro.API/MedSourcePro.API.csproj", "src/MedSourcePro.API/"]
COPY ["src/MedSourcePro.Application/MedSourcePro.Application.csproj", "src/MedSourcePro.Application/"]
COPY ["src/MedSourcePro.Infrastructure/MedSourcePro.Infrastructure.csproj", "src/MedSourcePro.Infrastructure/"]
COPY ["src/MedSourcePro.Domain/MedSourcePro.Domain.csproj", "src/MedSourcePro.Domain/"]

# Restore dependencies
RUN dotnet restore "src/MedSourcePro.API/MedSourcePro.API.csproj"

# Copy all source
COPY . .

# Build
WORKDIR "/src/src/MedSourcePro.API"
RUN dotnet build "MedSourcePro.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "MedSourcePro.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "MedSourcePro.API.dll"]
```

**Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:80
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=medsourcepro;Username=postgres;Password=postgres123
      - ConnectionStrings__Redis=redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - medsourcepro-network

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: medsourcepro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - medsourcepro-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - medsourcepro-network

  seq:
    image: datalust/seq:latest
    environment:
      ACCEPT_EULA: Y
    ports:
      - "5341:80"
    networks:
      - medsourcepro-network

volumes:
  postgres-data:

networks:
  medsourcepro-network:
    driver: bridge
```

### 7.2 CI/CD Pipeline (GitHub Actions)

**Create .github/workflows/ci-cd.yml**:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  DOTNET_VERSION: '8.0.x'
  AZURE_WEBAPP_NAME: medsourcepro-api
  
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
    
    - name: Restore dependencies
      run: dotnet restore
    
    - name: Build
      run: dotnet build --no-restore --configuration Release
    
    - name: Run unit tests
      run: dotnet test tests/MedSourcePro.Application.Tests --no-build --configuration Release --logger "trx;LogFileName=test-results.trx"
    
    - name: Run integration tests
      run: dotnet test tests/MedSourcePro.API.IntegrationTests --no-build --configuration Release --logger "trx;LogFileName=integration-test-results.trx"
    
    - name: Publish test results
      uses: EnricoMi/publish-unit-test-result-action@v2
      if: always()
      with:
        files: '**/*.trx'
    
    - name: Code coverage
      run: |
        dotnet test --no-build --configuration Release --collect:"XPlat Code Coverage"
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}

  build-and-push-docker:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/medsourcepro-api:latest
          ${{ secrets.DOCKER_USERNAME }}/medsourcepro-api:${{ github.sha }}
    
  deploy-to-azure:
    runs-on: ubuntu-latest
    needs: build-and-push-docker
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        images: ${{ secrets.DOCKER_USERNAME }}/medsourcepro-api:${{ github.sha }}
```

### 7.3 Environment-Specific Configuration

**Create appsettings.Production.json** (excluded from git):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "",
    "Redis": ""
  },
  "JwtSettings": {
    "SecretKey": "",
    "Issuer": "https://api.medsourcepro.com",
    "Audience": "https://medsourcepro.com"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning",
      "Microsoft.EntityFrameworkCore": "Error"
    }
  },
  "CorsOrigins": [
    "https://medsourcepro.com",
    "https://www.medsourcepro.com"
  ]
}
```

---

## Phase 8: Database Optimization

### 8.1 Migration Cleanup

**Current state**: 71 migration files

**Action**: Squash migrations after backing up production data:
```bash
# Backup production database first!
pg_dump -h hostname -U username -d medsourcepro > backup_$(date +%Y%m%d).sql

# Remove all migrations
rm -rf Migrations/

# Create fresh migration from current state
dotnet ef migrations add InitialCreate --context Context

# Update database
dotnet ef database update --context Context
```

### 8.2 Add Missing Indexes

**Analyze slow queries and add indexes**:
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct < 0.01
ORDER BY tablename, attname;

-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_orders_status ON "Orders" ("Status");
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON "Orders" ("CustomerId");
CREATE INDEX CONCURRENTLY idx_orders_created_at ON "Orders" ("CreatedAt" DESC);
CREATE INDEX CONCURRENTLY idx_products_provider_id ON "Products" ("ProviderId");
CREATE INDEX CONCURRENTLY idx_quotes_customer_id ON "Quotes" ("CustomerId");
```

**Add to EF Core configurations**:
```csharp
// Infrastructure/Persistence/Configurations/OrderConfiguration.cs
builder.HasIndex(o => o.Status);
builder.HasIndex(o => o.CustomerId);
builder.HasIndex(o => o.CreatedAt).IsDescending();
```

---

## Phase 9: Documentation

### 9.1 API Documentation

**XML documentation on all public APIs**:
```csharp
/// <summary>
/// Creates a new account
/// </summary>
/// <param name="command">Account creation details</param>
/// <returns>Created account information</returns>
/// <response code="201">Account created successfully</response>
/// <response code="400">Invalid request data</response>
[HttpPost]
[AllowAnonymous]
[ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<IActionResult> Create([FromBody] CreateAccountCommand command)
{
    var result = await _mediator.Send(command);
    return result.IsSuccess 
        ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
        : BadRequest(result.Error);
}
```

### 9.2 README and Architecture Documentation

**Create comprehensive documentation**:
- `README.md` - Setup instructions
- `ARCHITECTURE.md` - System design
- `API.md` - API endpoint documentation
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - Development guidelines

---

## Implementation Order & Estimates

### Phase 1: Critical Security Fixes (1-2 days) 🔴 URGENT
- Move secrets to User Secrets / Environment Variables
- Fix CORS configuration
- Enable HTTPS requirement

### Phase 2: Clean Architecture Restructure (5-7 days)
- Create new project structure
- Implement CQRS with MediatR
- Create DTOs and AutoMapper profiles
- Migrate controllers to thin controllers

### Phase 3: API Improvements (3-4 days)
- Add API versioning
- Implement global exception handling
- Add FluentValidation pipeline
- Configure Serilog

### Phase 4: Performance & Caching (2-3 days)
- Add Redis caching
- Optimize database queries
- Implement repository pattern (optional)

### Phase 5: Health Checks & Monitoring (1-2 days)
- Add health check endpoints
- Configure Application Insights
- Set up custom health checks

### Phase 6: Testing Infrastructure (4-5 days)
- Create unit test project
- Create integration test project
- Write tests for critical flows
- Set up test coverage reporting

### Phase 7: DevOps & Deployment (3-4 days)
- Create Dockerfile
- Create docker-compose configuration
- Set up CI/CD pipeline
- Configure environment-specific settings

### Phase 8: Database Optimization (1-2 days)
- Squash migrations
- Add missing indexes
- Optimize query performance

### Phase 9: Documentation (1-2 days)
- XML documentation on APIs
- Create comprehensive README
- Document architecture decisions

**Total estimated time**: 21-31 days

---

## Success Criteria

### Security
- ✅ No hardcoded secrets in code
- ✅ HTTPS enforced in production
- ✅ CORS properly configured
- ✅ JWT tokens signed securely
- ✅ Passwords hashed with BCrypt
- ✅ API rate limiting implemented

### Architecture
- ✅ Clean Architecture principles followed
- ✅ CQRS pattern implemented
- ✅ Separation of concerns maintained
- ✅ DTOs used for all API responses
- ✅ No entities exposed to clients

### Code Quality
- ✅ 80%+ code coverage
- ✅ Zero critical code smells (SonarQube)
- ✅ All public APIs documented
- ✅ Consistent naming conventions
- ✅ No TODO comments in production

### Performance
- ✅ API response time < 200ms (p95)
- ✅ Database query time < 50ms (average)
- ✅ Caching implemented for hot paths
- ✅ Connection pooling optimized

### DevOps
- ✅ CI/CD pipeline functional
- ✅ Automated tests passing
- ✅ Docker images building successfully
- ✅ Health checks responding correctly

### Monitoring
- ✅ Structured logging in place
- ✅ Application Insights configured
- ✅ Health check endpoints available
- ✅ Error tracking functional

---

## Frontend Compatibility Notes

**Changes required in frontend due to backend modernization**:

### API Endpoints Changed
1. **Base URL with versioning**: `/api/v1/[controller]` instead of `/api/[controller]`
2. **Response format changed**: All responses now use standardized DTOs
3. **Error format changed**: All errors now use ProblemDetails format

### Authentication Flow
1. **Login response changed**:
```typescript
// OLD
{ statusCode: 200, message: "login_success", payload: "jwt_token_string" }

// NEW
{ 
  token: "jwt_token_string",
  expiresAt: "2024-12-31T23:59:59Z",
  account: { id: 1, username: "user", email: "user@example.com", ... }
}
```

2. **Token storage**: Frontend should store `token` from LoginResponseDto

### Pagination Changed
1. **Request format**:
```typescript
// OLD - sent as query params
?page=1&pageSize=10

// NEW - sent as POST body
POST /api/v1/accounts/search
{
  page: 1,
  pageSize: 10,
  filters: { ... },
  sortBy: "name",
  sortOrder: "asc"
}
```

2. **Response format changed to standard PagedResult<T>**

### Error Handling
Frontend should handle new ProblemDetails error format:
```typescript
{
  status: 400,
  title: "Bad Request",
  detail: "Username already exists",
  instance: "/api/v1/accounts"
}
```

### Breaking Changes to Address

1. **Update API client service** to handle new response/error formats
2. **Update authentication flow** to work with new login response
3. **Update pagination components** to use new request/response format
4. **Update error handling** to parse ProblemDetails
5. **Add API versioning** to all API calls (v1)

**Migration strategy**: Backend should support both old and new endpoints temporarily during frontend migration period.

---

## Risk Mitigation

### Potential Risks

1. **Data Loss During Migration**
   - Mitigation: Full database backup before any migration
   - Fallback: Restore from backup if issues occur

2. **Breaking Changes in API**
   - Mitigation: API versioning, support v1 and v2 simultaneously
   - Fallback: Keep old endpoints active during transition

3. **Performance Regression**
   - Mitigation: Load testing before and after changes
   - Fallback: Revert to previous version if performance degrades

4. **Security Vulnerabilities**
   - Mitigation: Security audit after changes
   - Fallback: Penetration testing to identify issues

5. **Third-Party Service Issues**
   - Mitigation: Circuit breaker pattern for external services
   - Fallback: Graceful degradation when services unavailable

### Rollback Strategy

1. Keep old code in separate branch
2. Feature flags for major changes
3. Database migration rollback scripts
4. Blue-green deployment strategy
5. Gradual rollout (10% → 50% → 100%)

---

## Post-Migration Enhancements

### Future Improvements (Post-MVP)

1. **Event Sourcing**
   - Track all changes to entities
   - Audit trail for compliance
   - Time travel debugging

2. **Microservices Architecture**
   - Split into smaller services (Orders, Products, Accounts)
   - API Gateway (Ocelot)
   - Service mesh (Istio)

3. **GraphQL API**
   - Add GraphQL endpoint alongside REST
   - HotChocolate implementation
   - Real-time subscriptions

4. **Background Jobs**
   - Hangfire for scheduled tasks
   - Email queue processing
   - Report generation

5. **Advanced Security**
   - OAuth2/OpenID Connect
   - Multi-factor authentication
   - Role-based access control (RBAC)
   - API key management

6. **Performance**
   - Database read replicas
   - CDN for static assets
   - ElasticSearch for full-text search
   - Message queue (RabbitMQ/Azure Service Bus)

---

## Conclusion

This backend modernization plan transforms the MedSource Pro API from a monolithic application with security vulnerabilities into a secure, scalable, well-architected system following industry best practices. By implementing:

- **Clean Architecture** with clear separation of concerns
- **CQRS pattern** for better scalability
- **Comprehensive security** with proper secret management
- **Modern DevOps practices** with CI/CD and containerization
- **Robust testing** for reliability
- **Monitoring and logging** for observability

The backend will be production-ready, maintainable, and compatible with the modernized frontend, providing a solid foundation for MedSource Pro's growth.

**Next Steps**: Begin with Phase 1 (Security Fixes) immediately, as these are critical security vulnerabilities that must be addressed before any other work.

