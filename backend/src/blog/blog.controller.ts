import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('admin/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findAll() { 
    return this.blogService.getAllPosts(); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.blogService.getPostById(id); 
  }

  @Post()
  create(@Body() data: any) { 
    return this.blogService.createPost(data); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { 
    return this.blogService.updatePost(id, data); 
  }

  @Delete(':id')
  remove(@Param('id') id: string) { 
    return this.blogService.deletePost(id); 
  }
}