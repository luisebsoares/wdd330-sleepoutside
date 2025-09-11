import { renderListWithTemplate } from "./utils.mjs";

function producrCardTemplate(product) {
    return `<li class="product-card">
        <a href="product_pages/?products=${product.Id}">
        <img src="${product.image}" alt="${product.Name}" />
        <h2>${product.Brand}</h2>
        <h3>${product.Name}</h3>
        <p class="product-card__price">$${product.Price}</p>
        </a>
    </li>`;
}


export default class ProductList {
    constructor(category, dataSource, listElement) {
        this.category = category;
        this.dataSource = dataSource;
        this.listElement = listElement;
    }

    async init() {
        const list = await this.dataSource.getData();
        this.render(list);
    }

    render(list) {
        renderListWithTemplate(producrCardTemplate, this.listElement, list);
    }
}