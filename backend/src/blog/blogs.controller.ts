import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog') // Frontend API (api.get('/blog/...')) is raste par aayegi
export class BlogsController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * GET /blog
   * Website par saare LIVE (Published) blogs dikhane ke liye
   */
  @Get()
  async findAllActive() {
    return this.blogService.getActivePosts();
  }

  /**
   * GET /blog/:slug
   * URL ke zariye kisi specific blog ko open karne ke liye
   * Yeh function aapka 404 (Not Found) error solve karega
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }
}