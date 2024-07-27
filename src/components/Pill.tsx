import React from 'react';

const Pill = ({ text, variant }: { text: string, variant: 'info' | 'success' | 'error' | 'warning' }) => {
    return (
        <div className={`pill ${variant}`}>
            {text}
        </div>
    );
}

export default Pill;
