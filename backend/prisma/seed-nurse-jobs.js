const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const adminId = '2ea7701d-cf7e-4ba3-85e4-4d22d959ed84';

const realHospitals = [
  {
    name: "Mayo Clinic",
    domain: "mayoclinic.org",
    location: "Rochester, MN",
    specialty: "ICU / Critical Care",
    // Mayo Clinic main campus Rochester exterior
    image: "https://picsum.photos/seed/hospital-1/800/600",
    logo: "https://logo.clearbit.com/mayoclinic.org"
  },
  {
    name: "Johns Hopkins Hospital",
    domain: "hopkinsmedicine.org",
    location: "Baltimore, MD",
    specialty: "Emergency Room (ER)",
    // Hospital building modern facade
    image: "https://picsum.photos/seed/hospital-2/800/600",
    logo: "https://logo.clearbit.com/hopkinsmedicine.org"
  },
  {
    name: "Cleveland Clinic",
    domain: "clevelandclinic.org",
    location: "Cleveland, OH",
    specialty: "Oncology",
    // Large medical center exterior
    image: "https://picsum.photos/seed/hospital-3/800/600",
    logo: "https://logo.clearbit.com/clevelandclinic.org"
  },
  {
    name: "Massachusetts General Hospital",
    domain: "massgeneral.org",
    location: "Boston, MA",
    specialty: "Operating Room (OR)",
    // Classic brick hospital building
    image: "https://picsum.photos/seed/hospital-4/800/600",
    logo: "https://logo.clearbit.com/massgeneral.org"
  },
  {
    name: "UCLA Health",
    domain: "uclahealth.org",
    location: "Los Angeles, CA",
    specialty: "Pediatrics",
    // Modern California medical building
    image: "https://picsum.photos/seed/hospital-5/800/600",
    logo: "https://logo.clearbit.com/uclahealth.org"
  },
  {
    name: "NewYork-Presbyterian",
    domain: "nyp.org",
    location: "New York, NY",
    specialty: "Neonatal ICU (NICU)",
    // NYC urban hospital tower
    image: "https://picsum.photos/seed/hospital-6/800/600",
    logo: "https://logo.clearbit.com/nyp.org"
  },
  {
    name: "Cedars-Sinai Medical Center",
    domain: "cedars-sinai.org",
    location: "Los Angeles, CA",
    specialty: "Psychiatric / Mental Health",
    // Modern glass medical building
    image: "https://picsum.photos/seed/hospital-7/800/600",
    logo: "https://logo.clearbit.com/cedars-sinai.org"
  },
  {
    name: "UCSF Health",
    domain: "ucsfhealth.org",
    location: "San Francisco, CA",
    specialty: "Dialysis",
    // Bay area modern hospital
    image: "https://picsum.photos/seed/hospital-8/800/600",
    logo: "https://logo.clearbit.com/ucsfhealth.org"
  },
  {
    name: "Stanford Health Care",
    domain: "stanfordhealthcare.org",
    location: "Stanford, CA",
    specialty: "Telemetry",
    // Stanford campus style building
    image: "https://picsum.photos/seed/hospital-9/800/600",
    logo: "https://logo.clearbit.com/stanfordhealthcare.org"
  },
  {
    name: "Northwestern Memorial",
    domain: "nm.org",
    location: "Chicago, IL",
    specialty: "ICU / Critical Care",
    // Chicago tall hospital tower
    image: "https://picsum.photos/seed/hospital-10/800/600",
    logo: "https://logo.clearbit.com/nm.org"
  },
  {
    name: "Mount Sinai Hospital",
    domain: "mountsinai.org",
    location: "New York, NY",
    specialty: "Emergency Room (ER)",
    // NYC medical building entrance
    image: "https://picsum.photos/seed/hospital-11/800/600",
    logo: "https://logo.clearbit.com/mountsinai.org"
  },
  {
    name: "Houston Methodist",
    domain: "houstonmethodist.org",
    location: "Houston, TX",
    specialty: "Oncology",
    // Texas medical center building
    image: "https://picsum.photos/seed/hospital-12/800/600",
    logo: "https://logo.clearbit.com/houstonmethodist.org"
  },
  {
    name: "Duke University Hospital",
    domain: "dukehealth.org",
    location: "Durham, NC",
    specialty: "Operating Room (OR)",
    // University hospital stone building
    image: "https://picsum.photos/seed/hospital-13/800/600",
    logo: "https://logo.clearbit.com/dukehealth.org"
  },
  {
    name: "Brigham and Women's Hospital",
    domain: "brighamandwomens.org",
    location: "Boston, MA",
    specialty: "Pediatrics",
    // Boston hospital red brick
    image: "https://picsum.photos/seed/hospital-14/800/600",
    logo: "https://logo.clearbit.com/brighamandwomens.org"
  },
  {
    name: "Jefferson Health",
    domain: "jeffersonhealth.org",
    location: "Philadelphia, PA",
    specialty: "Neonatal ICU (NICU)",
    // Philadelphia hospital building
    image: "https://picsum.photos/seed/hospital-15/800/600",
    logo: "https://logo.clearbit.com/jeffersonhealth.org"
  },
  {
    name: "Emory University Hospital",
    domain: "emoryhealthcare.org",
    location: "Atlanta, GA",
    specialty: "Psychiatric / Mental Health",
    // Atlanta modern medical complex
    image: "https://picsum.photos/seed/hospital-16/800/600",
    logo: "https://logo.clearbit.com/emoryhealthcare.org"
  },
  {
    name: "UPMC Presbyterian",
    domain: "upmc.com",
    location: "Pittsburgh, PA",
    specialty: "Dialysis",
    // Pittsburgh medical tower
    image: "https://picsum.photos/seed/hospital-17/800/600",
    logo: "https://logo.clearbit.com/upmc.com"
  },
  {
    name: "UNC Medical Center",
    domain: "unchealth.org",
    location: "Chapel Hill, NC",
    specialty: "Telemetry",
    // Academic medical campus
    image: "https://picsum.photos/seed/hospital-18/800/600",
    logo: "https://logo.clearbit.com/unchealth.org"
  },
  {
    name: "Vanderbilt University Medical Center",
    domain: "vumc.org",
    location: "Nashville, TN",
    specialty: "ICU / Critical Care",
    // Nashville hospital modern building
    image: "https://picsum.photos/seed/hospital-19/800/600",
    logo: "https://logo.clearbit.com/vumc.org"
  },
  {
    name: "St. Jude Children's Research Hospital",
    domain: "stjude.org",
    location: "Memphis, TN",
    specialty: "Pediatrics",
    image: "https://picsum.photos/seed/hospital-20/800/600",
    logo: "https://logo.clearbit.com/stjude.org"
  },
  {
    name: "Barnes-Jewish Hospital",
    domain: "bjc.org",
    location: "St. Louis, MO",
    specialty: "Surgical OR Nurse",
    image: "https://picsum.photos/seed/hospital-21/800/600",
    logo: "https://logo.clearbit.com/bjc.org"
  },
  {
    name: "Rush University Medical Center",
    domain: "rush.edu",
    location: "Chicago, IL",
    specialty: "ICU Charge Nurse",
    image: "https://picsum.photos/seed/hospital-22/800/600",
    logo: "https://logo.clearbit.com/rush.edu"
  },
  {
    name: "University of Michigan Health",
    domain: "uofmhealth.org",
    location: "Ann Arbor, MI",
    specialty: "Pediatric ER Specialist",
    image: "https://picsum.photos/seed/hospital-23/800/600",
    logo: "https://logo.clearbit.com/uofmhealth.org"
  },
  {
    name: "UT Southwestern Medical Center",
    domain: "utswmed.org",
    location: "Dallas, TX",
    specialty: "Oncology Specialist",
    image: "https://picsum.photos/seed/hospital-24/800/600",
    logo: "https://logo.clearbit.com/utswmed.org"
  },
  {
    name: "UC San Diego Health",
    domain: "ucsdhealth.org",
    location: "San Diego, CA",
    specialty: "ER Trauma RN",
    image: "https://picsum.photos/seed/hospital-25/800/600",
    logo: "https://logo.clearbit.com/ucsdhealth.org"
  },
  {
    name: "University of Kansas Hospital",
    domain: "kansashealthsystem.com",
    location: "Kansas City, KS",
    specialty: "Dialysis Care Nurse",
    image: "https://picsum.photos/seed/hospital-26/800/600",
    logo: "https://logo.clearbit.com/kansashealthsystem.com"
  },
  {
    name: "University of Virginia Medical Center",
    domain: "uvahealth.com",
    location: "Charlottesville, VA",
    specialty: "Telemetry Staff Nurse",
    image: "https://picsum.photos/seed/hospital-27/800/600",
    logo: "https://logo.clearbit.com/uvahealth.com"
  },
  {
    name: "Strong Memorial Hospital",
    domain: "urmc.rochester.edu",
    location: "Rochester, NY",
    specialty: "Senior ICU Nurse",
    image: "https://picsum.photos/seed/hospital-28/800/600",
    logo: "https://logo.clearbit.com/urmc.rochester.edu"
  },
  {
    name: "Ochsner Medical Center",
    domain: "ochsner.org",
    location: "New Orleans, LA",
    specialty: "NICU Registered Nurse",
    image: "https://picsum.photos/seed/hospital-29/800/600",
    logo: "https://logo.clearbit.com/ochsner.org"
  },
  {
    name: "Wexner Medical Center",
    domain: "wexnermedical.osu.edu",
    location: "Columbus, OH",
    specialty: "Mental Health RN",
    image: "https://picsum.photos/seed/hospital-30/800/600",
    logo: "https://logo.clearbit.com/wexnermedical.osu.edu"
  },
  {
    name: "Oregon Health & Science University",
    domain: "ohsu.edu",
    location: "Portland, OR",
    specialty: "Cardiac Telemetry RN",
    image: "https://picsum.photos/seed/hospital-31/800/600",
    logo: "https://logo.clearbit.com/ohsu.edu"
  },
  {
    name: "Tufts Medical Center",
    domain: "tuftsmedicalcenter.org",
    location: "Boston, MA",
    specialty: "Junior Pediatric Nurse",
    image: "https://picsum.photos/seed/hospital-32/800/600",
    logo: "https://logo.clearbit.com/tuftsmedicalcenter.org"
  },
  {
    name: "Memorial Hermann",
    domain: "memorialhermann.org",
    location: "Houston, TX",
    specialty: "Neonatal Nurse Practitioner",
    image: "https://picsum.photos/seed/hospital-33/800/600",
    logo: "https://logo.clearbit.com/memorialhermann.org"
  },
  {
    name: "Banner Health",
    domain: "bannerhealth.com",
    location: "Phoenix, AZ",
    specialty: "Critical Care RN",
    image: "https://picsum.photos/seed/hospital-34/800/600",
    logo: "https://logo.clearbit.com/bannerhealth.com"
  },
  {
    name: "Yale New Haven Hospital",
    domain: "ynhh.org",
    location: "New Haven, CT",
    specialty: "Emergency Room Nurse",
    image: "https://picsum.photos/seed/hospital-35/800/600",
    logo: "https://logo.clearbit.com/ynhh.org"
  },
  {
    name: "Scripps Memorial Hospital La Jolla",
    domain: "scripps.org",
    location: "La Jolla, CA",
    specialty: "Inpatient Oncology RN",
    image: "https://picsum.photos/seed/hospital-36/800/600",
    logo: "https://logo.clearbit.com/scripps.org"
  },
  {
    name: "Inova Fairfax Hospital",
    domain: "inova.org",
    location: "Falls Church, VA",
    specialty: "Operating Room RN",
    image: "https://picsum.photos/seed/hospital-37/800/600",
    logo: "https://logo.clearbit.com/inova.org"
  },
  {
    name: "Corewell Health",
    domain: "corewellhealth.org",
    location: "Grand Rapids, MI",
    specialty: "Psychiatric Staff Nurse",
    image: "https://picsum.photos/seed/hospital-38/800/600",
    logo: "https://logo.clearbit.com/corewellhealth.org"
  },
  {
    name: "Loyola University Medical Center",
    domain: "loyolamedicine.org",
    location: "Maywood, IL",
    specialty: "Head of Dialysis",
    image: "https://picsum.photos/seed/hospital-39/800/600",
    logo: "https://logo.clearbit.com/loyolamedicine.org"
  },
  {
    name: "Baptist Health South Florida",
    domain: "baptisthealth.net",
    location: "Miami, FL",
    specialty: "Staff Nurse Lead",
    image: "https://picsum.photos/seed/hospital-40/800/600",
    logo: "https://logo.clearbit.com/baptisthealth.net"
  }
];

const jobTitles = [
  "Senior ICU Nurse",
  "ER Trauma RN",
  "Oncology Specialist",
  "Surgical OR Nurse",
  "Pediatric Lead Nurse",
  "NICU Registered Nurse",
  "Mental Health RN",
  "Dialysis Care Nurse",
  "Telemetry Staff Nurse",
  "Critical Care RN",
  "Emergency Room Nurse",
  "Inpatient Oncology RN",
  "Operating Room RN",
  "Junior Pediatric Nurse",
  "Neonatal Nurse Practitioner",
  "Psychiatric Staff Nurse",
  "Head of Dialysis",
  "Cardiac Telemetry RN",
  "ICU Charge Nurse",
  "Pediatric ER Specialist",
  "Senior Surgical RN",
  "Critical Care Specialist",
  "Emergency Trauma Lead",
  "Oncology Nurse Practitioner",
  "Pediatric Staff Nurse",
  "Dialysis Clinic RN",
  "Telemetry Health Nurse",
  "ICU Staff RN",
  "Neonatal Care Specialist",
  "Mental Health Advocate RN",
  "Cardiac Care Specialist",
  "Junior Pediatrics RN",
  "NICU Charge Nurse",
  "Staff Nurse Leader",
  "Emergency Room RN",
  "Inpatient Oncology Specialist",
  "Operating Room Nurse",
  "Psychiatric Health Lead",
  "Head of Patient Care",
  "Regional Staff Nurse"
];

async function main() {
  console.log('--- Cleaning up old mock data ---');
  await prisma.job.deleteMany({ where: { postedById: adminId } });
  console.log('--- Starting Elite Hospital & Job Seeding ---');

  for (let i = 0; i < realHospitals.length; i++) {
    const hosp = realHospitals[i];
    const jobTitle = jobTitles[i];

    console.log(`Processing: ${hosp.name}...`);

    const companySlug = hosp.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    let company = await prisma.company.findUnique({ where: { slug: companySlug } });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: hosp.name,
          slug: companySlug,
          category: 'Hospital',
          description: `${hosp.name} is a world-class healthcare institution dedicated to excellence in patient care and medical research.`,
          logoUrl: hosp.logo,
          website: `https://${hosp.domain}`,
          address: hosp.location,
          status: 'APPROVED',
          isFeatured: true,
          ownerId: adminId,
          CompanyImage: {
            create: {
              url: hosp.image,
              altText: `${hosp.name} Building`
            }
          }
        }
      });
    } else {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          logoUrl: hosp.logo,
          CompanyImage: {
            deleteMany: {},
            create: {
              url: hosp.image,
              altText: `${hosp.name} Building`
            }
          }
        }
      });
    }

    const jobSlug =
      jobTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') +
      '-' +
      Math.random().toString(36).substring(7);

    await prisma.job.create({
      data: {
        title: jobTitle,
        slug: jobSlug,
        specialty: hosp.specialty,
        location: hosp.location,
        jobType: ['Full-time', 'Travel', 'Contract'][Math.floor(Math.random() * 3)],
        salaryMin: 80000 + Math.floor(Math.random() * 20000),
        salaryMax: 110000 + Math.floor(Math.random() * 30000),
        salaryCurrency: 'USD',
        salaryPeriod: 'YEARLY',
        description: `Join ${hosp.name} as a ${jobTitle}. We are seeking a dedicated professional to join our ${hosp.specialty} department. Use your expertise to provide exceptional nursing care in ${hosp.location}.`,
        requirements: 'Valid Nursing License, BLS/ACLS, 2+ Years Experience in Specialty.',
        status: 'APPROVED',
        companyId: company.id,
        postedById: adminId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`✅ Created Job: ${jobTitle} at ${hosp.name}`);
  }

  console.log('--- Seeding Completed Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());