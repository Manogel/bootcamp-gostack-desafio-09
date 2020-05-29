import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create(data: ICreateProductDTO): Promise<Product> {
    const { name, price, quantity } = data;

    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const formattedname = name.trim();

    const product = await this.ormRepository.findOne({
      where: {
        name: formattedname,
      },
    });

    return product;
  }

  public async findAllById(productsIds: IFindProducts[]): Promise<Product[]> {
    const ids = productsIds.map(({ id }) => id);
    const products = this.ormRepository.find({
      where: {
        id: In(ids),
      },
    });

    return products;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = await this.ormRepository.save(products);

    return updatedProducts;
  }
}

export default ProductsRepository;
