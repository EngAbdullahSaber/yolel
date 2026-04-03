import { GetPanigationMethod, DeleteMethod, CreateMethod } from "./ApiMethod";

export interface RefusedImageUserInfo {
  id: number;
  email: string | null;
  name: string | null;
}

export interface RefusedImage {
  id: number;
  imageUrl: string;
  imagePath: string;
  refusalReason: string;
  gender: string;
  ageType: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: RefusedImageUserInfo;
}

export interface RefusedImagesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: RefusedImage[];
  totalItems: number;
  totalPages: number;
}

export const fetchRefusedImagesApi = async (
  page: number,
  pageSize: number,
  lang: string,
  searchTerm: string = ""
): Promise<RefusedImagesResponse> => {
  return (await GetPanigationMethod(
    "/image/admin/refused",
    page,
    pageSize,
    lang,
    searchTerm
  )) as RefusedImagesResponse;
};

export const deleteRefusedImageApi = async (
  id: number,
  lang: string
): Promise<any> => {
  return await DeleteMethod("image/admin/refused", id, lang);
};

export const acceptRefusedImageApi = async (
  id: number,
  lang: string
): Promise<any> => {
  return await CreateMethod(`image/admin/refused/${id}/accept`, {}, lang);
};
