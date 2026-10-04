import { PrismaClient, Role, ServiceType, OutageStatus, ReportStatus, SeverityLevel, AnnouncementPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up existing data ---');
  await prisma.notification.deleteMany();
  await prisma.affectedConfirmation.deleteMany();
  await prisma.outageUpdate.deleteMany();
  await prisma.outageReport.deleteMany();
  await prisma.outage.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.area.deleteMany();
  await prisma.woreda.deleteMany();
  await prisma.subCity.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Creating Sub-Cities, Woredas, and Areas ---');

  const subCitiesData = [
    {
      name: 'Bole',
      amharicName: 'ቦሌ',
      code: 'AA-BOL',
      latitude: 8.9950,
      longitude: 38.7885,
      description: 'Major commercial, diplomatic, and residential hub of eastern Addis Ababa.',
      woredas: [
        {
          name: 'Woreda 01',
          code: 'BOL-01',
          latitude: 9.0012,
          longitude: 38.7820,
          areas: ['Bole Medhanialem', 'Atlas Hotel Area', 'Rwanda', 'Peacock Park']
        },
        {
          name: 'Woreda 03',
          code: 'BOL-03',
          latitude: 8.9910,
          longitude: 38.7950,
          areas: ['Bole Airport Vicinity', 'Japanese Embassy Area', 'Brass Clinic']
        },
        {
          name: 'Woreda 05',
          code: 'BOL-05',
          latitude: 9.0120,
          longitude: 38.7750,
          areas: ['Edna Mall Area', 'Dembel City Center', 'Olympia']
        }
      ]
    },
    {
      name: 'Yeka',
      amharicName: 'የካ',
      code: 'AA-YEK',
      latitude: 9.0305,
      longitude: 38.8052,
      description: 'North-eastern sub-city spanning Megenagna commercial corridor and mountain foothills.',
      woredas: [
        {
          name: 'Woreda 06',
          code: 'YEK-06',
          latitude: 9.0220,
          longitude: 38.7990,
          areas: ['Megenagna Square', 'Shola Market', 'Signal Area']
        },
        {
          name: 'Woreda 08',
          code: 'YEK-08',
          latitude: 9.0350,
          longitude: 38.8250,
          areas: ['CMC Michael', 'Kotebe Metropolitan University', 'Ayat Zone 2']
        },
        {
          name: 'Woreda 11',
          code: 'YEK-11',
          latitude: 9.0480,
          longitude: 38.7850,
          areas: ['Ferensay Legasion', 'Yeka Abado Condominium']
        }
      ]
    },
    {
      name: 'Kirkos',
      amharicName: 'ቂርቆስ',
      code: 'AA-KIR',
      latitude: 9.0084,
      longitude: 38.7578,
      description: 'Central administrative and financial heart of Addis Ababa.',
      woredas: [
        {
          name: 'Woreda 02',
          code: 'KIR-02',
          latitude: 9.0150,
          longitude: 38.7610,
          areas: ['Kazanchis (UNECA)', 'Intercontinental Area', 'Bambis']
        },
        {
          name: 'Woreda 04',
          code: 'KIR-04',
          latitude: 9.0090,
          longitude: 38.7520,
          areas: ['Meskel Square', 'Addis Ababa Stadium', 'Legehar']
        },
        {
          name: 'Woreda 08',
          code: 'KIR-08',
          latitude: 8.9950,
          longitude: 38.7580,
          areas: ['Gotera Interchange', 'Beklobet', 'Bulgaria Mazoriya']
        }
      ]
    },
    {
      name: 'Arada',
      amharicName: 'አራዳ',
      code: 'AA-ARA',
      latitude: 9.0358,
      longitude: 38.7523,
      description: 'Historic cultural center of Addis Ababa including Piassa and government palaces.',
      woredas: [
        {
          name: 'Woreda 01',
          code: 'ARA-01',
          latitude: 9.0340,
          longitude: 38.7490,
          areas: ['Piassa Posta', 'Taitu Hotel Area', 'Churchill Avenue']
        },
        {
          name: 'Woreda 02',
          code: 'ARA-02',
          latitude: 9.0380,
          longitude: 38.7580,
          areas: ['4 Kilo (Parliament & Palace)', '6 Kilo (Addis Ababa University)']
        }
      ]
    },
    {
      name: 'Lideta',
      amharicName: 'ልደታ',
      code: 'AA-LID',
      latitude: 9.0142,
      longitude: 38.7392,
      description: 'Densely populated residential and judicial corridor in south-central Addis.',
      woredas: [
        {
          name: 'Woreda 03',
          code: 'LID-03',
          latitude: 9.0120,
          longitude: 38.7350,
          areas: ['Lideta Condominiums', 'Balcha Hospital', 'Federal High Court']
        },
        {
          name: 'Woreda 05',
          code: 'LID-05',
          latitude: 9.0190,
          longitude: 38.7280,
          areas: ['Tor Hailoch', 'Abinet Square', 'Mexico Square West']
        }
      ]
    },
    {
      name: 'Addis Ketema',
      amharicName: 'አዲስ ከተማ',
      code: 'AA-ADK',
      latitude: 9.0315,
      longitude: 38.7360,
      description: 'Home of Merkato, Africa’s largest open-air marketplace.',
      woredas: [
        {
          name: 'Woreda 04',
          code: 'ADK-04',
          latitude: 9.0310,
          longitude: 38.7330,
          areas: ['Merkato Sebategna', 'Military Tera', 'Bomb Tera']
        },
        {
          name: 'Woreda 07',
          code: 'ADK-07',
          latitude: 9.0390,
          longitude: 38.7290,
          areas: ['Autobis Tera', 'Anwar Mosque Area', 'Amanuel Hospital']
        }
      ]
    },
    {
      name: 'Nifas Silk-Lafto',
      amharicName: 'ንፋስ ስልክ ላፍቶ',
      code: 'AA-NSL',
      latitude: 8.9664,
      longitude: 38.7342,
      description: 'Rapidly expanding residential and industrial southern sub-city.',
      woredas: [
        {
          name: 'Woreda 01',
          code: 'NSL-01',
          latitude: 8.9550,
          longitude: 38.7300,
          areas: ['Jomo 1 Condominium', 'Jomo 2 & 3', 'Michael Roundabout']
        },
        {
          name: 'Woreda 05',
          code: 'NSL-05',
          latitude: 8.9720,
          longitude: 38.7420,
          areas: ['Saris Dama Hotel Area', 'Kadisco', 'Gofa Camp']
        },
        {
          name: 'Woreda 09',
          code: 'NSL-09',
          latitude: 8.9830,
          longitude: 38.7210,
          areas: ['Lebu Mebrathail', 'German Square', 'Lafto Mall']
        }
      ]
    },
    {
      name: 'Kolfe Keranio',
      amharicName: 'ኮልፌ ቀራንዮ',
      code: 'AA-KOL',
      latitude: 9.0223,
      longitude: 38.7058,
      description: 'Western industrial, transport terminal, and residential district.',
      woredas: [
        {
          name: 'Woreda 03',
          code: 'KOL-03',
          latitude: 9.0150,
          longitude: 38.7020,
          areas: ['Ayer Tena Roundabout', 'Alem Bank', 'Kara Alo']
        },
        {
          name: 'Woreda 09',
          code: 'KOL-09',
          latitude: 9.0340,
          longitude: 38.7080,
          areas: ['Asko Bus Terminal', 'Zenebework', 'Kolfe Police Station']
        }
      ]
    },
    {
      name: 'Gullele',
      amharicName: 'ጉለሌ',
      code: 'AA-GUL',
      latitude: 9.0628,
      longitude: 38.7389,
      description: 'North-western sub-city covering Entoto hills, botanical gardens, and traditional weaving villages.',
      woredas: [
        {
          name: 'Woreda 01',
          code: 'GUL-01',
          latitude: 9.0550,
          longitude: 38.7480,
          areas: ['Shiromeda Traditional Market', 'Entoto Park Gate', 'American Embassy North']
        },
        {
          name: 'Woreda 06',
          code: 'GUL-06',
          latitude: 9.0620,
          longitude: 38.7310,
          areas: ['Addisu Gebeya', 'Semen Mazegaja', 'Winget Ring Road']
        }
      ]
    },
    {
      name: 'Akaky Kaliti',
      amharicName: 'አቃቂ ቃሊቲ',
      code: 'AA-AKA',
      latitude: 8.8953,
      longitude: 38.7758,
      description: 'Major logistics hub, dry port, heavy industrial area, and southern highway gateway.',
      woredas: [
        {
          name: 'Woreda 01',
          code: 'AKA-01',
          latitude: 8.8890,
          longitude: 38.7710,
          areas: ['Kality Customs & Dry Port', 'Crown Hotel Area', 'Kality Bus Terminal']
        },
        {
          name: 'Woreda 03',
          code: 'AKA-03',
          latitude: 8.8780,
          longitude: 38.7910,
          areas: ['Akaki Old Town', 'Tulu Dimtu Condominium', 'Gelan Industrial Area']
        }
      ]
    },
    {
      name: 'Lemi Kura',
      amharicName: 'ለሚ ኩራ',
      code: 'AA-LEM',
      latitude: 9.0185,
      longitude: 38.8350,
      description: 'Newly chartered sub-city in east Addis Ababa with major residential expansion and tech centers.',
      woredas: [
        {
          name: 'Woreda 02',
          code: 'LEM-02',
          latitude: 9.0190,
          longitude: 38.8410,
          areas: ['Summit Condominiums', 'Safari Area', 'Pepsi Factory Road']
        },
        {
          name: 'Woreda 04',
          code: 'LEM-04',
          latitude: 9.0270,
          longitude: 38.8520,
          areas: ['Ayat Real Estate', 'Meri Luke', 'Beshale Hotel Corridor', 'Goro Roundabout']
        }
      ]
    }
  ];

  const createdSubCities: Record<string, any> = {};
  const createdWoredas: Record<string, any> = {};
  const createdAreas: Record<string, any> = {};

  for (const scData of subCitiesData) {
    const sc = await prisma.subCity.create({
      data: {
        name: scData.name,
        amharicName: scData.amharicName,
        code: scData.code,
        latitude: scData.latitude,
        longitude: scData.longitude,
        description: scData.description,
      }
    });
    createdSubCities[scData.name] = sc;

    for (const wData of scData.woredas) {
      const woreda = await prisma.woreda.create({
        data: {
          name: wData.name,
          code: wData.code,
          latitude: wData.latitude,
          longitude: wData.longitude,
          subCityId: sc.id,
        }
      });
      createdWoredas[`${scData.name}-${wData.name}`] = woreda;

      for (const areaName of wData.areas) {
        const area = await prisma.area.create({
          data: {
            name: areaName,
            woredaId: woreda.id,
            latitude: wData.latitude + (Math.random() - 0.5) * 0.005,
            longitude: wData.longitude + (Math.random() - 0.5) * 0.005,
            landmark: `Near ${areaName} junction`
          }
        });
        createdAreas[`${scData.name}-${areaName}`] = area;
      }
    }
  }

  console.log(`Created ${Object.keys(createdSubCities).length} sub-cities, ${Object.keys(createdWoredas).length} woredas, and ${Object.keys(createdAreas).length} areas.`);

  console.log('--- Creating Users ---');
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Dawit Alemayehu',
      email: 'admin@addistracker.et',
      password: adminPasswordHash,
      phone: '+251 911 234 567',
      role: Role.ADMIN,
      bio: 'Chief Municipal Utilities Dispatcher & Operations Supervisor',
      subCityId: createdSubCities['Bole'].id,
      address: 'Bole Medhanialem, Street 14',
    }
  });

  const dispatcher = await prisma.user.create({
    data: {
      name: 'Tigist Bekele',
      email: 'dispatcher@addistracker.et',
      password: adminPasswordHash,
      phone: '+251 911 765 432',
      role: Role.DISPATCHER,
      bio: 'Operations Verification Officer - AAWSA & EEU Joint Taskforce',
      subCityId: createdSubCities['Kirkos'].id,
      address: 'Kazanchis, Guinea Conakry St',
    }
  });

  const resident1 = await prisma.user.create({
    data: {
      name: 'Yosef Mehari',
      email: 'yosef@example.com',
      password: userPasswordHash,
      phone: '+251 922 102 030',
      role: Role.USER,
      subCityId: createdSubCities['Bole'].id,
      woredaId: createdWoredas['Bole-Woreda 01'].id,
      address: 'Atlas Hotel, near Shala Park',
    }
  });

  const resident2 = await prisma.user.create({
    data: {
      name: 'Helen Tadesse',
      email: 'helen@example.com',
      password: userPasswordHash,
      phone: '+251 933 456 789',
      role: Role.USER,
      subCityId: createdSubCities['Yeka'].id,
      woredaId: createdWoredas['Yeka-Woreda 08'].id,
      address: 'CMC Michael, Site 4, Block 12',
    }
  });

  const resident3 = await prisma.user.create({
    data: {
      name: 'Samuel Kebede',
      email: 'samuel@example.com',
      password: userPasswordHash,
      phone: '+251 944 888 999',
      role: Role.USER,
      subCityId: createdSubCities['Nifas Silk-Lafto'].id,
      woredaId: createdWoredas['Nifas Silk-Lafto-Woreda 09'].id,
      address: 'German Square, Lebu Mebrathail',
    }
  });

  console.log('--- Creating Outages ---');
  const now = new Date();

  // Outage 1: Water Pipe Burst in Bole Atlas
  const outage1 = await prisma.outage.create({
    data: {
      title: 'Major Water Main Line Burst along Bole Atlas Corridor',
      serviceType: ServiceType.WATER,
      problemType: 'Pipe Burst / Main Line Rupture',
      status: OutageStatus.ACTIVE,
      severity: SeverityLevel.HIGH,
      description: 'High-pressure distribution pipe damaged due to light rail drainage maintenance work near Atlas Hotel. AAWSA emergency technicians are on site with excavation machinery.',
      subCityId: createdSubCities['Bole'].id,
      woredaId: createdWoredas['Bole-Woreda 01'].id,
      areaId: createdAreas['Bole-Atlas Hotel Area']?.id,
      specificLocation: 'Namibia St, between Atlas and Rwanda Embassy',
      latitude: 9.0018,
      longitude: 38.7835,
      startedAt: new Date(now.getTime() - 4.5 * 3600 * 1000), // 4.5 hours ago
      estimatedRestoration: new Date(now.getTime() + 3.5 * 3600 * 1000), // in 3.5 hours
      verifiedAt: new Date(now.getTime() - 4 * 3600 * 1000),
      verifiedById: admin.id,
      createdById: resident1.id,
      affectedReportsCount: 18,
      restoredVotesCount: 1,
    }
  });

  await prisma.outageUpdate.createMany({
    data: [
      {
        outageId: outage1.id,
        title: 'Emergency Crew Dispatched',
        message: 'AAWSA rapid response unit arriving with replacement ductile iron pipe segment.',
        updateType: 'CREW_DISPATCHED',
        authorId: admin.id,
        createdAt: new Date(now.getTime() - 3.5 * 3600 * 1000),
      },
      {
        outageId: outage1.id,
        title: 'Isolation Valve Shut Down',
        message: 'Water flow isolated from Bole Medhanialem feeder valve to prevent flooding. Excavation underway.',
        updateType: 'REPAIR_IN_PROGRESS',
        authorId: dispatcher.id,
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
      }
    ]
  });

  // Outage 2: Power Grid Feeder Outage in Piassa & Churchill
  const outage2 = await prisma.outage.create({
    data: {
      title: '15kV Feeder Line Trip Affecting Piassa & Churchill Avenue',
      serviceType: ServiceType.ELECTRICITY,
      problemType: 'Distribution Feeder Tripping',
      status: OutageStatus.ACTIVE,
      severity: SeverityLevel.CRITICAL,
      description: 'Underground 15kV transmission line tripped at Arada substation, cutting power across commercial sectors of Piassa, Churchill, and Cathedral areas.',
      subCityId: createdSubCities['Arada'].id,
      woredaId: createdWoredas['Arada-Woreda 01'].id,
      areaId: createdAreas['Arada-Piassa Posta']?.id,
      specificLocation: 'Churchill Road towards Taitu Hotel junction',
      latitude: 9.0345,
      longitude: 38.7510,
      startedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      estimatedRestoration: new Date(now.getTime() + 1.5 * 3600 * 1000),
      verifiedAt: new Date(now.getTime() - 1.8 * 3600 * 1000),
      verifiedById: admin.id,
      createdById: admin.id,
      affectedReportsCount: 34,
      restoredVotesCount: 3,
    }
  });

  await prisma.outageUpdate.create({
    data: {
      outageId: outage2.id,
      title: 'EEU Substation Diagnostics Completed',
      message: 'Short-circuit identified near Post Office switchboard. Backup line diversion initiated.',
      updateType: 'REPAIR_IN_PROGRESS',
      authorId: dispatcher.id,
      createdAt: new Date(now.getTime() - 1 * 3600 * 1000),
    }
  });

  // Outage 3: Power Blackout in Lemi Kura / Ayat & Summit
  const outage3 = await prisma.outage.create({
    data: {
      title: 'Transformer Failure at Ayat Real Estate Sector 4',
      serviceType: ServiceType.ELECTRICITY,
      problemType: 'Blown Transformer / Heavy Load Failure',
      status: OutageStatus.INVESTIGATING,
      severity: SeverityLevel.HIGH,
      description: 'Pole-mounted distribution transformer caught sparks during evening peak load. Residents report total darkness across Zone 4 and neighboring condominiums.',
      subCityId: createdSubCities['Lemi Kura'].id,
      woredaId: createdWoredas['Lemi Kura-Woreda 04'].id,
      areaId: createdAreas['Lemi Kura-Ayat Real Estate']?.id,
      specificLocation: 'Ayat Zone 4, near Meri Luke Commercial Center',
      latitude: 9.0280,
      longitude: 38.8510,
      startedAt: new Date(now.getTime() - 1 * 3600 * 1000),
      estimatedRestoration: new Date(now.getTime() + 5 * 3600 * 1000),
      verifiedAt: new Date(now.getTime() - 0.8 * 3600 * 1000),
      verifiedById: dispatcher.id,
      createdById: resident2.id,
      affectedReportsCount: 22,
      restoredVotesCount: 0,
    }
  });

  // Outage 4: Water Outage in Saris & Lebu (Restored recently)
  const outage4 = await prisma.outage.create({
    data: {
      title: 'Scheduled Pressure Valve Replacement in Lebu Mebrathail',
      serviceType: ServiceType.WATER,
      problemType: 'Scheduled Maintenance / Valve Replacement',
      status: OutageStatus.RESTORED,
      severity: SeverityLevel.MEDIUM,
      description: 'Scheduled pressure regulator replacement successfully finished by AAWSA South Branch. Normal water supply restored to all Lebu and German Square zones.',
      subCityId: createdSubCities['Nifas Silk-Lafto'].id,
      woredaId: createdWoredas['Nifas Silk-Lafto-Woreda 09'].id,
      areaId: createdAreas['Nifas Silk-Lafto-Lebu Mebrathail']?.id,
      specificLocation: 'Lebu Mebrathail roundabout towards German Square',
      latitude: 8.9820,
      longitude: 38.7230,
      startedAt: new Date(now.getTime() - 12 * 3600 * 1000),
      estimatedRestoration: new Date(now.getTime() - 2 * 3600 * 1000),
      restoredAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
      verifiedAt: new Date(now.getTime() - 11 * 3600 * 1000),
      verifiedById: admin.id,
      createdById: resident3.id,
      affectedReportsCount: 15,
      restoredVotesCount: 14,
    }
  });

  await prisma.outageUpdate.create({
    data: {
      outageId: outage4.id,
      title: 'Water Pressure Fully Re-established',
      message: 'Both booster pumps activated. Residents report full tap flow returning.',
      updateType: 'RESTORED',
      authorId: admin.id,
      createdAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
    }
  });

  // Outage 5: Restored Power Outage in Kazanchis
  const outage5 = await prisma.outage.create({
    data: {
      title: 'Emergency Cable Fault Repair in Kazanchis Financial District',
      serviceType: ServiceType.ELECTRICITY,
      problemType: 'Cable Trench Water Ingress',
      status: OutageStatus.RESTORED,
      severity: SeverityLevel.HIGH,
      description: 'Heavy rainfall caused water ingress into electrical service pit. Technical teams insulated joints and restored supply.',
      subCityId: createdSubCities['Kirkos'].id,
      woredaId: createdWoredas['Kirkos-Woreda 02'].id,
      areaId: createdAreas['Kirkos-Kazanchis (UNECA)']?.id,
      specificLocation: 'Kazanchis, near Intercontinental Hotel',
      latitude: 9.0160,
      longitude: 38.7620,
      startedAt: new Date(now.getTime() - 8 * 3600 * 1000),
      estimatedRestoration: new Date(now.getTime() - 3 * 3600 * 1000),
      restoredAt: new Date(now.getTime() - 2.5 * 3600 * 1000),
      verifiedAt: new Date(now.getTime() - 7.5 * 3600 * 1000),
      verifiedById: admin.id,
      affectedReportsCount: 29,
      restoredVotesCount: 24,
    }
  });

  // Outage 6: Water Outage in Megenagna & CMC (Pending Verification)
  const outage6 = await prisma.outage.create({
    data: {
      title: 'Low Water Pressure and Discoloration in CMC Michael Area',
      serviceType: ServiceType.WATER,
      problemType: 'Low Pressure / Muddy Water',
      status: OutageStatus.PENDING,
      severity: SeverityLevel.MEDIUM,
      description: 'Multiple households report zero water pressure on higher floors and murky water from ground tanks.',
      subCityId: createdSubCities['Yeka'].id,
      woredaId: createdWoredas['Yeka-Woreda 08'].id,
      areaId: createdAreas['Yeka-CMC Michael']?.id,
      specificLocation: 'CMC Michael, Site 2 near Sunshine Condos',
      latitude: 9.0360,
      longitude: 38.8270,
      startedAt: new Date(now.getTime() - 1.2 * 3600 * 1000),
      createdById: resident2.id,
      affectedReportsCount: 7,
      restoredVotesCount: 0,
    }
  });

  console.log('--- Creating Individual User Reports ---');
  await prisma.outageReport.createMany({
    data: [
      {
        outageId: outage1.id,
        serviceType: ServiceType.WATER,
        problemType: 'Pipe Burst / Main Line Rupture',
        description: 'Clean drinking water is gushing into the road next to Atlas hotel. The whole street is flooded.',
        subCityId: createdSubCities['Bole'].id,
        woredaId: createdWoredas['Bole-Woreda 01'].id,
        specificLocation: 'Atlas Hotel junction, Street 3',
        latitude: 9.0020,
        longitude: 38.7830,
        reporterName: 'Yosef Mehari',
        reporterPhone: '+251 922 102 030',
        reporterEmail: 'yosef@example.com',
        userId: resident1.id,
        status: ReportStatus.VERIFIED,
        startedAt: new Date(now.getTime() - 4.5 * 3600 * 1000),
      },
      {
        outageId: outage1.id,
        serviceType: ServiceType.WATER,
        problemType: 'No Water / Supply Disrupted',
        description: 'Our compound taps are completely dry since 10am this morning.',
        subCityId: createdSubCities['Bole'].id,
        woredaId: createdWoredas['Bole-Woreda 01'].id,
        specificLocation: 'Rwanda Embassy road, compound 45',
        latitude: 9.0010,
        longitude: 38.7840,
        reporterName: 'Almaz Kassa',
        reporterPhone: '+251 911 334 455',
        reporterEmail: 'almaz@gmail.com',
        status: ReportStatus.VERIFIED,
        startedAt: new Date(now.getTime() - 4 * 3600 * 1000),
      },
      {
        outageId: outage2.id,
        serviceType: ServiceType.ELECTRICITY,
        problemType: 'Power Blackout',
        description: 'Total blackout across Churchill road. All shop shutters and traffic lights are off.',
        subCityId: createdSubCities['Arada'].id,
        woredaId: createdWoredas['Arada-Woreda 01'].id,
        specificLocation: 'Near Piassa Posta and Cinema Empire',
        latitude: 9.0350,
        longitude: 38.7515,
        reporterName: 'Bereket T.',
        reporterPhone: '+251 912 445 566',
        status: ReportStatus.VERIFIED,
        startedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      },
      {
        // Standalone pending user report awaiting admin action
        serviceType: ServiceType.WATER,
        problemType: 'Suspected Leakage',
        description: 'Water bubbling up from under cobblestone street near Merkato Sebategna.',
        subCityId: createdSubCities['Addis Ketema'].id,
        woredaId: createdWoredas['Addis Ketema-Woreda 04'].id,
        specificLocation: 'Sebategna textile line, opposite Mosque',
        latitude: 9.0315,
        longitude: 38.7340,
        reporterName: 'Mulugeta Haile',
        reporterPhone: '+251 910 998 877',
        reporterEmail: 'mulugeta@outlook.com',
        status: ReportStatus.PENDING,
        startedAt: new Date(now.getTime() - 0.7 * 3600 * 1000),
      },
      {
        // Standalone pending power report
        serviceType: ServiceType.ELECTRICITY,
        problemType: 'Voltage Fluctuation / Sparks',
        description: 'Sparks flying from electric pole whenever wind blows. Bulbs flickering rapidly.',
        subCityId: createdSubCities['Kolfe Keranio'].id,
        woredaId: createdWoredas['Kolfe Keranio-Woreda 03'].id,
        specificLocation: 'Ayer Tena round, near commercial bank',
        latitude: 9.0160,
        longitude: 38.7030,
        reporterName: 'Fatuma Ahmed',
        reporterPhone: '+251 915 678 123',
        status: ReportStatus.PENDING,
        startedAt: new Date(now.getTime() - 0.5 * 3600 * 1000),
      }
    ]
  });

  console.log('--- Creating Affected Confirmations ---');
  await prisma.affectedConfirmation.createMany({
    data: [
      {
        outageId: outage1.id,
        userId: resident1.id,
        comment: 'Taps are still bone dry in Atlas building 4.',
        isStillAffected: true,
      },
      {
        outageId: outage2.id,
        userId: resident3.id,
        comment: 'Offices along Churchill road running on diesel generators.',
        isStillAffected: true,
      },
      {
        outageId: outage4.id,
        userId: resident3.id,
        comment: 'Water returned at 3:15 PM with good pressure. Thank you!',
        isStillAffected: false,
      }
    ]
  });

  console.log('--- Creating Announcements ---');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Bole Sub-City Scheduled Power Substation Maintenance',
        content: 'Ethiopian Electric Utility (EEU) will conduct preventive maintenance on the 33kV Bole Substation switchgears on Sunday, 8:00 AM – 2:00 PM. Affected areas include Atlas, Bole Medhanialem, and Rwanda. Residents are advised to prepare accordingly.',
        serviceType: ServiceType.ELECTRICITY,
        priority: AnnouncementPriority.HIGH,
        subCityId: createdSubCities['Bole'].id,
        authorId: admin.id,
        scheduledStart: new Date(now.getTime() + 24 * 3600 * 1000),
        scheduledEnd: new Date(now.getTime() + 30 * 3600 * 1000),
        isActive: true,
      },
      {
        title: 'Legedadi Treatment Plant Water Pressure Adjustment Notice',
        content: 'AAWSA is conducting annual sedimentation flush at Legedadi Reservoir. Intermittent low pressure is expected across Yeka, Lemi Kura, and northern Bole sub-cities for the next 48 hours.',
        serviceType: ServiceType.WATER,
        priority: AnnouncementPriority.MEDIUM,
        subCityId: null, // citywide
        authorId: admin.id,
        scheduledStart: now,
        scheduledEnd: new Date(now.getTime() + 48 * 3600 * 1000),
        isActive: true,
      },
      {
        title: 'Emergency 24/7 Hotline Operational for Outage Reporting',
        content: 'Citizens can report downed electrical wires or high-pressure water pipe bursts directly through this web tracker or call the municipal rapid response toll-free lines: Water (944) | Electricity (905).',
        serviceType: ServiceType.BOTH,
        priority: AnnouncementPriority.LOW,
        subCityId: null,
        authorId: admin.id,
        isActive: true,
      }
    ]
  });

  console.log('--- Creating Notifications ---');
  await prisma.notification.createMany({
    data: [
      {
        userId: resident1.id,
        title: 'Outage Verified in Your Sub-City (Bole)',
        message: 'A Water outage at Bole Atlas has been verified by the municipal dispatcher. Repairs are in progress.',
        type: NotificationType.OUTAGE_VERIFIED,
        linkUrl: `/outages/${outage1.id}`,
        isRead: false,
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
      },
      {
        userId: resident1.id,
        title: 'Status Update: Bole Atlas Water Line',
        message: 'Excavation completed and replacement pipe segment being welded.',
        type: NotificationType.STATUS_CHANGED,
        linkUrl: `/outages/${outage1.id}`,
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
      },
      {
        userId: resident3.id,
        title: 'Service Restored: Lebu Mebrathail Water',
        message: 'Water supply to Lebu Mebrathail and German Square has been officially restored.',
        type: NotificationType.SERVICE_RESTORED,
        linkUrl: `/outages/${outage4.id}`,
        isRead: true,
        createdAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
      },
      {
        userId: resident2.id,
        title: 'Important Utility Announcement',
        message: 'Legedadi Treatment Plant Water Pressure Adjustment Notice affects your area.',
        type: NotificationType.ANNOUNCEMENT,
        linkUrl: `/announcements`,
        isRead: false,
        createdAt: new Date(now.getTime() - 3 * 3600 * 1000),
      }
    ]
  });

  console.log('--- Seed Completed Successfully! ---');
  console.log('Admin account: admin@addistracker.et / AdminPassword123!');
  console.log('User account:  yosef@example.com / UserPassword123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
