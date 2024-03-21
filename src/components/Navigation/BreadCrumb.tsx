"use client"

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function capitalizeFirstLetter(string: String) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function Breadcrumb() {
  const [pathSplit, setPathSplit] = React.useState<String[]>([]);
  const path = usePathname().toString();

  useEffect(() => {
    const regex = /(\/)|([^/]+)/g;
    const pathsplit = path.match(regex);
    setPathSplit(pathsplit!);
  }, [path]);

  if(path.startsWith("/dashboard/home")) return <></>
  
  return (
    <div style={{ display: "flex", margin: "10px 0px 20px 0px"}}>
      {pathSplit.map((value: String, index: number) => {

        if (index === 0 ) return;
        if (value === "/") return <span key={index} style={{ fontSize: 15, marginLeft: 6, marginRight: 6, color:'var(--slate);'}}>{value}</span>

        if (index < pathSplit.length - 1 && value !== "/") {
          // Create a new array without modifying the original pathSplit
          const mypath = pathSplit.slice(0, index + 1);

          return (
            <Link
              key={index}
              href={mypath.join("")} // Join the array elements without any separator
              style={{
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 300,
              }}
            >
              {capitalizeFirstLetter(value)}
            </Link>
          );
        }

        return (
          <span
            key={index}
            style={{ fontWeight: 500, color:'var(--slate);', fontSize: 15,}}
          >
             {capitalizeFirstLetter(value)}
          </span>
        );
      })}
    </div>
  );
}