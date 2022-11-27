/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpAdapter } from '../interfaces/http-adapter.interface';

export class AxiosAdapter implements HttpAdapter {
    
    private httpService: HttpService;

    async get<T>(url: string): Promise<T> {
        try {
            const { data } = await firstValueFrom( await this.httpService.get<T>(url));
            return data;
        } catch (error) {
            throw new Error('This es an error - Check logs');
        }
    }

}