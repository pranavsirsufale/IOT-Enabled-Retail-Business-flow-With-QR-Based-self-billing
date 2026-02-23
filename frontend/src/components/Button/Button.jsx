import React from "react";

export default function Button({
    children,
    onClick,
    type = "primary",
    disabled = false,
}) {
    const base =
        "w-full px-5 py-2 rounded-lg font-medium transition duration-200 active:scale-95";
    const styles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline:
            "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${styles[type]} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {children}
        </button>
    );
}