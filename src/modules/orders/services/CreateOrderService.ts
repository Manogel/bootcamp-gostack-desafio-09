import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';

import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

type IProductOrder = Array<{
  product_id: string;
  price: number;
  quantity: number;
}>;

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute(data: IRequest): Promise<Order> {
    const { customer_id, products } = data;

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer is not exists!');
    }

    const productsList = await this.productsRepository.findAllById(products);

    if (products.length !== productsList.length) {
      throw new AppError(`One or more product is not exists!`);
    }

    const formattedListProduct: IProductOrder = [];

    const updatedList: IProduct[] = [];

    productsList.forEach(product => {
      const { id, price, quantity } = product;
      const findProduct = products.find(
        productRequired => productRequired.id === id,
      );

      if (!findProduct) return;

      if (findProduct.quantity > quantity) {
        throw new AppError('quantity not available.');
      }

      updatedList.push({
        id,
        quantity: quantity - findProduct.quantity,
      });

      formattedListProduct.push({
        product_id: id,
        price,
        quantity: findProduct.quantity,
      });
    });

    const order = await this.ordersRepository.create({
      customer,
      products: formattedListProduct,
    });

    await this.productsRepository.updateQuantity(updatedList);

    return order;
  }
}

export default CreateOrderService;
