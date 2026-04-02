import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitContact(
    @Body() 
    body: { name: string; email: string; phone?: string; subject: string; message: string }
  ) {
    return this.contactService.submitContact(body);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.contactService.getById(id);
  }
}
