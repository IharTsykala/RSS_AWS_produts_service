import { response } from "../utils/response";
import { products } from "../mocks/products";

export const handler = async () => {
  try {
    return response(200, products);
  } catch (error: any) {
    return response(500, {
      message: error.message,
    });
  }
};
