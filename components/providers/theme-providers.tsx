"user client"

import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProviders({
    children,
    ...props
}: React.ComponentProps<typeof NextThemeProvider>) {
    return (
        <NextThemeProvider {...props}>
            {children}
        </NextThemeProvider>
    );
}