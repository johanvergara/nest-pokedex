/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {

    await this.pokemonModel.deleteMany({}) // delete * from pokemons

    const { data } = await firstValueFrom(
      this.httpService
      .get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
      .pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    const pokemonToInsert: { name: string, no: number }[] = [];
    
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[ segments.length - 2];
      try {
        // const pokemon = await this.pokemonModel.create({ name, no });
        // return pokemon;
        pokemonToInsert.push({ name, no });
      } catch (error) {
        this.handleExceptions(error);
      }
    });

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed';
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
