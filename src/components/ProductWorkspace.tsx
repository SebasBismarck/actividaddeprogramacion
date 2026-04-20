"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductWorkspace() {
  const formId = useId();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && description.trim().length > 0;
  }, [name, description]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadError(null);
      setIsLoadingProducts(true);
      const response = await fetch("/api/products", { method: "GET" });
      const payload = (await response.json()) as {
        products?: Product[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo cargar productos.");
      }

      setProducts(payload.products ?? []);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "No se pudo cargar productos.",
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async () => {
    setError(null);
    const parsed = Number.parseFloat(priceInput.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      setError("Ingresá un precio válido (número mayor o igual a 0).");
      return;
    }
    if (!name.trim() || !description.trim()) {
      setError("Completá el nombre y la descripción.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: parsed,
        }),
      });

      const payload = (await response.json()) as {
        product?: Product;
        message?: string;
      };

      if (!response.ok || !payload.product) {
        throw new Error(payload.message ?? "No se pudo agregar el producto.");
      }

      setProducts((prev) => [payload.product as Product, ...prev]);
      setName("");
      setDescription("");
      setPriceInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el producto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [description, name, priceInput]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-st-gray-muted/60 bg-st-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Image
            src="/logo.png"
            alt="SchoolTask"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-contain ring-2 ring-st-gray-muted/50"
            priority
          />
          <div>
            <p className="text-lg font-semibold tracking-tight text-st-charcoal">
              SchoolTask
            </p>
            <p className="text-sm text-st-charcoal/70">
              Gestión de productos
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start">
        <section className="w-full lg:w-[min(100%,26rem)] lg:shrink-0">
          <div className="rounded-2xl border border-st-gray-muted/70 bg-st-white p-6 shadow-md shadow-st-charcoal/5">
            <h2 className="text-base font-semibold text-st-charcoal">
              Alta de producto
            </h2>
            <p className="mt-1 text-sm text-st-charcoal/65">
              Completá los datos y agregá el producto al listado.
            </p>

            <form
              id={formId}
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                void addProduct();
              }}
            >
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-name`}
                  className="block text-sm font-medium text-st-charcoal"
                >
                  Nombre del producto
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  placeholder="Ej. Cuaderno universitario"
                  className="w-full rounded-xl border border-st-gray-muted bg-st-beige/40 px-4 py-2.5 text-st-charcoal placeholder:text-st-charcoal/40 outline-none transition focus:border-st-terracotta focus:ring-2 focus:ring-st-terracotta/25"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-detail`}
                  className="block text-sm font-medium text-st-charcoal"
                >
                  Detalle o descripción
                </label>
                <textarea
                  id={`${formId}-detail`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Características, tamaño, uso…"
                  className="w-full resize-y rounded-xl border border-st-gray-muted bg-st-beige/40 px-4 py-2.5 text-st-charcoal placeholder:text-st-charcoal/40 outline-none transition focus:border-st-terracotta focus:ring-2 focus:ring-st-terracotta/25"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-price`}
                  className="block text-sm font-medium text-st-charcoal"
                >
                  Valor o precio
                </label>
                <input
                  id={`${formId}-price`}
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-st-gray-muted bg-st-beige/40 px-4 py-2.5 text-st-charcoal placeholder:text-st-charcoal/40 outline-none transition focus:border-st-terracotta focus:ring-2 focus:ring-st-terracotta/25"
                />
              </div>

              {error ? (
                <p
                  className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-xl bg-st-terracotta px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-st-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Agregar producto"}
              </button>
            </form>
          </div>
        </section>

        <section className="min-h-[12rem] flex-1">
          <div className="rounded-2xl border border-st-gray-muted/70 bg-st-white p-6 shadow-md shadow-st-charcoal/5">
            <h2 className="text-base font-semibold text-st-charcoal">
              Productos dados de alta
            </h2>
            <p className="mt-1 text-sm text-st-charcoal/65">
              {isLoadingProducts
                ? "Cargando productos..."
                : products.length === 0
                ? "Todavía no hay productos. Agregá el primero desde el formulario."
                : `${products.length} producto${products.length === 1 ? "" : "s"} en el listado.`}
            </p>

            {loadError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {loadError}
              </p>
            ) : null}

            {!isLoadingProducts && products.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="group rounded-xl border border-st-gray bg-st-gray/40 p-4 transition hover:border-st-terracotta/35"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-st-charcoal truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-st-charcoal/75 whitespace-pre-wrap">
                        {product.description}
                      </p>
                      <p className="text-sm font-semibold text-st-terracotta">
                        Precio: {formatPrice(product.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
