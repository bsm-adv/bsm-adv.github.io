import type { ImageMetadata } from 'astro';
import dataPekerjaan from './pekerjaan.json';

// Ambil semua foto pekerjaan dari assets/kerja/{kategori}
const fotoPekerjaan = import.meta.glob<{ default: ImageMetadata }>(
    "../assets/kerja/*/*.jpg",
    { eager: true }
);

// Kelompokkan foto berdasarkan nama folder (slug)
const fotoBerdasarkanSlug = Object.entries(fotoPekerjaan).reduce(
    (hasil, [pathFoto, urlFoto]) => {
        const slug = pathFoto.split("/").at(-2)!;

        if (!hasil[slug]) {
            hasil[slug] = [];
        }

        hasil[slug].push(urlFoto.default);

        return hasil;
    },
    {} as Record<string, ImageMetadata[]>,
);

// Bentuk data akhir untuk ditampilkan
export const pekerjaan = Object.entries(fotoBerdasarkanSlug).map(([slug, daftarFoto]) => {
    const metadata = dataPekerjaan[slug as keyof typeof dataPekerjaan];

    return {
        slug,
        label: metadata?.label ?? slug,
        deskripsi: metadata?.deskripsi ?? "",
        nukilan: metadata?.nukilan ?? "",
        gambar: daftarFoto.sort(),
    };
});
