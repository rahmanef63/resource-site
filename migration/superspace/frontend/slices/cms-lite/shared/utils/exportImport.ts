export function exportToJSON<T>(data: T[], filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

export async function importFromJSON<T>(
  file: File,
  validator?: (data: any) => boolean
): Promise<ImportResult<T>> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: "Invalid JSON format: Expected an array",
      };
    }
    
    if (validator && !data.every(validator)) {
      return {
        success: false,
        error: "Invalid data format: One or more items failed validation",
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message || "Failed to parse JSON file",
    };
  }
}

export function createFileInput(
  accept: string,
  onSelect: (file: File) => void
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      onSelect(file);
    }
  };
  input.click();
}

export const mockData: Record<string, any[]> = {
  posts: [
    {
      title: "Sample Blog Post",
      slug: "sample-blog-post",
      excerpt: "This is a sample blog post excerpt",
      body: "This is the full content of the sample blog post.",
      locale: "en",
      status: "published",
      coverImage: "",
    },
  ],
  products: [
    {
      titleId: "Produk Contoh",
      titleEn: "Sample Product",
      titleAr: "منتج عينة",
      descId: "Deskripsi produk contoh",
      descEn: "Sample product description",
      descAr: "وصف المنتج العينة",
      price: 99.99,
      currency: "SAR",
      slug: "sample-product",
      published: true,
    },
  ],
  portfolio: [
    {
      title: "Sample Portfolio Item",
      description: "This is a sample portfolio item",
      slug: "sample-portfolio",
      locale: "en",
      status: "published",
      tags: ["photography", "sample"],
      images: [],
    },
  ],
  services: [
    {
      slug: "sample-service",
      labelId: "Layanan Contoh",
      labelEn: "Sample Service",
      labelAr: "خدمة عينة",
      displayOrder: 0,
      active: true,
    },
  ],
  features: [
    {
      icon: "Star",
      title: "Sample Feature",
      description: "This is a sample feature description",
      locale: "en",
      displayOrder: 0,
      active: true,
    },
  ],
  quicklinks: [
    {
      title: "Sample Quicklink",
      url: "https://example.com",
      displayOrder: 0,
      active: true,
    },
  ],
  navigation: [
    {
      labelId: "Beranda",
      labelEn: "Home",
      labelAr: "الصفحة الرئيسية",
      url: "/",
      displayOrder: 0,
      active: true,
    },
  ],
};
