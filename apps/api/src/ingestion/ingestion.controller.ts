import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OsmImportService } from './osm-import.service';
import { TrafficImportService } from './traffic-import.service';
import { WeatherService } from './weather.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/roles.decorator';
import { z } from 'zod';

const LimitSchema = z.coerce.number().int().min(1).max(500).default(100);
const LatitudeSchema = z.coerce.number().finite().min(-90).max(90);
const LongitudeSchema = z.coerce.number().finite().min(-180).max(180);

@ApiTags('ingestion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class IngestionController {
  constructor(
    private readonly osm: OsmImportService,
    private readonly traffic: TrafficImportService,
    private readonly weather: WeatherService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('ingestion/osm/import')
  @Roles('ADMIN')
  importOsm() {
    return this.osm.importAllAreas();
  }

  @Post('ingestion/traffic/import')
  @Roles('ADMIN')
  importTraffic() {
    return this.traffic.importTrafficEvents();
  }

  @Get('ingestion/logs')
  @Roles('ADMIN')
  getLogs() {
    return this.prisma.dataImportLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  @Get('ingestion/provider-status')
  @Roles('ADMIN')
  getProviderStatus() {
    return this.prisma.apiProviderStatus.findMany();
  }

  @Get('road-segments')
  getRoadSegments(@Query('limit') limit = '100') {
    return this.prisma.roadSegment.findMany({
      take: LimitSchema.parse(limit),
      orderBy: { importedAt: 'desc' },
    });
  }

  @Get('road-segments/nearby')
  getNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    LatitudeSchema.parse(lat);
    LongitudeSchema.parse(lng);
    return this.prisma.roadSegment.findMany({ take: 20 });
  }

  @Get('traffic-events')
  getTrafficEvents() {
    return this.traffic.getRecentEvents();
  }

  @Get('weather/current')
  getWeather(@Query('lat') lat = '46.66', @Query('lng') lng = '16.17') {
    return this.weather.getCurrentWeather(
      LatitudeSchema.parse(lat),
      LongitudeSchema.parse(lng),
    );
  }
}
