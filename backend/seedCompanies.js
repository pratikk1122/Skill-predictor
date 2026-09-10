require("dotenv").config();
const connectDB = require("./src/config/db");
const Company = require("./src/models/Company");

// ✅ Updated data with professional details
const companyData = [
  { name: "TCS", logo: "https://logo.clearbit.com/tcs.com", website: "tcs.com", courses: ["BCA"] },
  { name: "Infosys", logo: "https://logo.clearbit.com/infosys.com", website: "infosys.com", courses: ["BCA"] },
  { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com", website: "wipro.com", courses: ["BCA"] },
  { name: "Cognizant", logo: "https://logo.clearbit.com/cognizant.com", website: "cognizant.com", courses: ["BCA", "BSc"] },
  { name: "Capgemini", logo: "https://logo.clearbit.com/capgemini.com", website: "capgemini.com", courses: ["BCA", "BSc"] },
  { name: "Accenture", logo: "https://logo.clearbit.com/accenture.com", website: "accenture.com", courses: ["BCA", "BSc"] },
  { name: "HCL Technologies", logo: "https://logo.clearbit.com/hcltech.com", website: "hcltech.com", courses: ["BCA"] },
  { name: "Tech Mahindra", logo: "https://logo.clearbit.com/techmahindra.com", website: "techmahindra.com", courses: ["BCA"] },
  { name: "Zoho", logo: "https://logo.clearbit.com/zoho.com", website: "zoho.com", courses: ["BCA"] },
  { name: "Freshworks", logo: "https://logo.clearbit.com/freshworks.com", website: "freshworks.com", courses: ["BCA"] },
  { name: "Internshala", logo: "https://logo.clearbit.com/internshala.com", website: "internshala.com", courses: ["BCA"] },
  { name: "IBM India", logo: "https://logo.clearbit.com/ibm.com", website: "ibm.com", courses: ["BSc"] },
  { name: "Zensar Technologies", logo: "https://logo.clearbit.com/zensar.com", website: "zensar.com", courses: ["BSc"] },
  { name: "Persistent Systems", logo: "https://logo.clearbit.com/persistent.com", website: "persistent.com", courses: ["BSc"] },
  { name: "Mu Sigma", logo: "https://logo.clearbit.com/mu-sigma.com", website: "mu-sigma.com", courses: ["BSc"] },
  { name: "Fractal Analytics", logo: "https://logo.clearbit.com/fractal.ai", website: "fractal.ai", courses: ["BSc"] },
  { name: "Tiger Analytics", logo: "https://logo.clearbit.com/tigeranalytics.com", website: "tigeranalytics.com", courses: ["BSc"] },
  { name: "Tredence", logo: "https://logo.clearbit.com/tredence.com", website: "tredence.com", courses: ["BSc"] },
  { name: "Google India", logo: "https://logo.clearbit.com/google.com", website: "google.com", courses: ["BTech"] },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.in", website: "amazon.in", courses: ["BTech"] },
  { name: "Microsoft India", logo: "https://logo.clearbit.com/microsoft.com", website: "microsoft.com", courses: ["BTech"] },
  { name: "Oracle", logo: "https://logo.clearbit.com/oracle.com", website: "oracle.com", courses: ["BTech"] },
  { name: "SAP", logo: "https://logo.clearbit.com/sap.com", website: "sap.com", courses: ["BTech"] },
  { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com", website: "adobe.com", courses: ["BTech"] },
  { name: "Intel", logo: "https://logo.clearbit.com/intel.com", website: "intel.com", courses: ["BTech"] },
  { name: "NVIDIA", logo: "https://logo.clearbit.com/nvidia.com", website: "nvidia.com", courses: ["BTech"] },
  { name: "CDAC", logo: "https://logo.clearbit.com/cdac.in", website: "cdac.in", courses: ["BTech"] },
  { name: "DRDO", logo: "https://ui-avatars.com/api/?name=DRDO&background=0D9488&color=fff", website: "drdo.gov.in", courses: ["BTech"] }
];

const seedCompanies = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");

    for (const data of companyData) {
      const existing = await Company.findOne({ name: data.name });

      if (existing) {
        // Update existing record with new fields while keeping courses intact
        existing.logo = data.logo;
        existing.website = data.website;
        
        // Add new courses if they don't exist
        data.courses.forEach(course => {
          if (!existing.courses.includes(course)) {
            existing.courses.push(course);
          }
        });

        await existing.save();
        console.log(`🔄 Updated: ${data.name}`);
      } else {
        // Create new professional record
        await Company.create({
          name: data.name,
          logo: data.logo,
          website: data.website,
          courses: data.courses,
          status: "Active"
        });
        console.log(`✨ Created: ${data.name}`);
      }
    }

    const total = await Company.countDocuments();
    console.log(`🎉 Total Companies in Database: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedCompanies();