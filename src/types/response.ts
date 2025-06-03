export interface ResponseObject {
  id: number;
  original_filename: string;
  processed_filename: string;
  processed_image: string; // base64 image
  status: "success" | "error";
}

export type ResponseObjectArray = ResponseObject[];
