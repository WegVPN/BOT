import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { sort_order: 'ASC' },
      relations: ['forums'],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['forums'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createDto);
    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateDto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);
    await this.categoriesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.categoriesRepository.delete(id);
  }
}
