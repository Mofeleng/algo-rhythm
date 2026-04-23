"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "../../../../components/ui/breadcrumb";
import { useEffect, useState } from "react";

export function BreadcrumbPageClient() {
    const path = usePathname();
    const [ breadcrumbText, setBreadcrumbText ] = useState<string>("");

    useEffect(() => {
        if (path === "/dashboard") {
            setBreadcrumbText("Dashboard")
        }
        if (path === "/dashboard/create") {
            setBreadcrumbText("Dashboard > Create")
        }
    }, [breadcrumbText, path])
    return <BreadcrumbPage>
        <span className="text-xs font-bold">
            { breadcrumbText }
        </span>
    </BreadcrumbPage>
}