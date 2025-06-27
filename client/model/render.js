import { fetchProducts } from "./fetch.js";

export function createProductCard(product) {
  return `
    <div class="product-card-wrapper">
      <div class="product-card">
        <img src="${product.img}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">$${product.price}</div>
          <div class="product-specs">
            <div><i class="fas fa-mobile-alt me-2"></i>${product.screen}</div>
            <div><i class="fas fa-camera me-2"></i>Front: ${product.frontCamera}</div>
            <div><i class="fas fa-camera me-2"></i>Back: ${product.backCamera}</div>
          </div>
          <p class="product-desc">${product.desc}</p>
          <button class="btn btn-add-cart w-100" onclick="addToCart('${product.id}')">
            <i class="fas fa-shopping-cart me-2"></i>Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}
export async function render(selectedBrand = "all") {
  const data = await fetchProducts();
  const filteredData =
    selectedBrand === "all"
      ? data
      : data.filter((product) => product.type === selectedBrand);

  const wrapper = document.querySelector(".carousel-inner-wrapper");

  if ($(wrapper).hasClass("slick-initialized")) {
    $(wrapper).slick("unslick");
  }

  wrapper.innerHTML = filteredData.map(createProductCard).join("");

  $(wrapper).slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    dots: true,
    arrows: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  });
}
