import { response } from "../utils/response";
import { products } from "../mocks/products";

export const handler = async (event) => {
  try {
    const productId = event.pathParameters?.id;
    if (!productId) {
      return response(500, {
        message: "Error Id",
      });
    }
    const product = products.find((prod) => prod.id === productId);
    if (!product) {
      return response(500, {
        message: "Error Id",
      });
    }
    return response(200, product);
  } catch (error: any) {
    return response(500, {
      message: error.message,
    });
  }
};
