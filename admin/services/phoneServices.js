class phoneServices {
  url = "https://68552a486a6ef0ed6631845c.mockapi.io/Product";

  getPhonesDetails = async () => {
    try {
      const response = await axios({
        url: this.url,
        method: "GET",
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  getPhoneById = async (id) => {
    try {
      const response = await axios({
        url: `${this.url}/${id}`,
        method: "GET",
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  addPhone = async (phone) => {
    try {
      await axios({
        url: this.url,
        method: "POST",
        data: phone,
      });
    } catch (error) {
      console.log(error);
    }
  };

  updatePhone = async (phone) => {
    try {
      await axios({
        url: `${this.url}/${phone.id}`,
        method: "PUT",
        data: phone,
      });
    } catch (error) {
      console.log(error);
    }
  };

  deletePhone = async (id) => {
    try {
      await axios({
        url: `${this.url}/${id}`,
        method: "DELETE",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default phoneServices;
