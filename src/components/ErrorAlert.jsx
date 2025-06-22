import React from 'react';

export default function ErrorAlert({ error, onClose }) {
    if (!error) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                )}
            </div>
        </div>
    );
}