export async function fetchProducts() {
  try {
    const response = await axios.get(
      "https://68552a486a6ef0ed6631845c.mockapi.io/Product"
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
