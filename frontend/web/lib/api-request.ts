export async function baseApiRequest<T>(url: string, options: RequestInit):Promise<T> {
    const res = await fetch(url, options);

    if (res.status === 204) return {} as T;

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.title || "An unexpected error occured");
    }

    return result;
}

export async function postApiRequest<T>(url: string, body: any):Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    });

    if (res.status === 204) return {} as T;

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.title || "An unexpected error occured");
    }

    return result;
}

export async function getApiRequest<T>(url: string):Promise<T> {
    const res = await fetch(url, { credentials: "include" });

    if (res.status === 204) return [{}] as T;

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.title || "An unexpected error occured");
    }

    return result;
}

export async function deleteApiRequest<T>(url: string, body: any):Promise<T> {
    const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    });

    if (res.status === 204) return {} as T;

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.title || "An unexpected error occured");
    }

    return result;
}

export async function patchApiRequest<T>(url: string, body: any):Promise<T> {
    const res = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    });

    if (res.status === 204) return {} as T;

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.title || "An unexpected error occured");
    }

    return result;
}