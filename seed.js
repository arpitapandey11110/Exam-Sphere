const mongoose = require("mongoose");
require("dotenv").config();
const Department = require("./models/Department");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Fix legacy index: drop unique index on name and apply compound index (name,college)
  try {
    const indexes = await Department.collection.indexes();
    const hasBad = indexes.some(i => i.name === 'name_1');
    if (hasBad) {
      await Department.collection.dropIndex('name_1');
      console.log('🧹 Dropped legacy index name_1');
    }
  } catch (e) {
    // ignore if index not present
  }
  try {
    await Department.syncIndexes();
    console.log('🔄 Synced Department indexes');
  } catch (e) {
    console.log('Index sync warning:', e?.message || e);
  }

  // Keep existing data; we'll upsert below to avoid wiping other colleges
  // await Department.deleteMany({});

  const rdn_science = {
    college: "R. D. National College, Bandra West",
    name: "Science",
    courses: [
      {
        name: "B.Sc Computer Science",
        years: {
          FY: [
            { name: "Programming Fundamentals" },
            { name: "Mathematics I" },
            { name: "Physics / Chemistry I" },
            { name: "English / Communication Skills" }
          ],
          SY: [
            { name: "Data Structures" },
            { name: "Discrete Mathematics" },
            { name: "Electronics / Digital Logic" },
            { name: "Laboratory Work" }
          ],
          TY: [
            { name: "Algorithms" },
            { name: "Operating Systems" },
            { name: "Project Work / Dissertation" },
            { name: "Electives (e.g. AI, Web Dev etc.)" }
          ]
        }
      },
      {
        name: "B.Sc Information Technology",
        years: {
          FY: [
            { name: "Basics of IT / Computing" },
            { name: "Mathematics I" },
            { name: "Physics / Chemistry I" },
            { name: "English / Communication Skills" }
          ],
          SY: [
            { name: "Database Systems" },
            { name: "Networking" },
            { name: "Web Technologies" },
            { name: "Laboratory Work" }
          ],
          TY: [
            { name: "Software Engineering" },
            { name: "Mobile / Emerging Technologies" },
            { name: "Project Work" },
            { name: "Electives" }
          ]
        }
      },
      {
        name: "B.Sc Biotechnology",
        years: {
          FY: [
            { name: "Biology / Cell Biology" },
            { name: "Chemistry I" },
            { name: "Mathematics / Statistics" },
            { name: "English / Communication Skills" }
          ],
          SY: [
            { name: "Genetics / Microbiology" },
            { name: "Biochemistry" },
            { name: "Lab Techniques" },
            { name: "Electives / Minor Subjects" }
          ],
          TY: [
            { name: "Molecular Biology" },
            { name: "Biotech Applications / Techniques" },
            { name: "Research / Project Work" },
            { name: "Electives" }
          ]
        }
      },
      {
        name: "B.Sc General Science",
        years: {
          FY: [
            { name: "Physics I" },
            { name: "Chemistry I" },
            { name: "Mathematics I" },
            { name: "English" }
          ],
          SY: [
            { name: "Physics II" },
            { name: "Chemistry II" },
            { name: "Optional Subject I" },
            { name: "Optional Subject II" }
          ],
          TY: [
            { name: "Advanced Topics in Chosen Subjects" },
            { name: "Project / Dissertation" },
            { name: "Electives / Minor Subjects" },
            { name: "Practical Lab Work" }
          ]
        }
      }
    ]
  };

  const rdn_commerce = {
    college: "R. D. National College, Bandra West",
    name: "Commerce & Management",
    courses: [
      {
        name: "B.Com (General)",
        years: {
          FY: [
            { name: "Financial Accounting I" },
            { name: "Business Law / Organization" },
            { name: "Economics I / Microeconomics" },
            { name: "English / Business Communication" }
          ],
          SY: [
            { name: "Cost Accounting / Management Accounting" },
            { name: "Economics II / Macroeconomics" },
            { name: "Company Law / Business Regulations" },
            { name: "Optional Electives / Taxation Basics" }
          ],
          TY: [
            { name: "Advanced Accounting / Auditing" },
            { name: "Income Tax / GST / Indirect Taxes" },
            { name: "Project / Research Work" },
            { name: "Electives / Specialization" }
          ]
        }
      },
      {
        name: "B.Com (Accounting & Finance)",
        years: {
          FY: [
            { name: "Financial Accounting I" },
            { name: "Principles of Management" },
            { name: "Microeconomics" },
            { name: "English / Communication Skills" }
          ],
          SY: [
            { name: "Corporate Accounting" },
            { name: "Business Mathematics & Statistics" },
            { name: "Cost and Management Accounting" },
            { name: "Finance Basics / Banking" }
          ],
          TY: [
            { name: "Financial Markets / Investment Analysis" },
            { name: "Auditing / Taxation" },
            { name: "Project / Internship / Research" },
            { name: "Electives in Finance / Accounting" }
          ]
        }
      },
      {
        name: "BMS (Bachelor of Management Studies)",
        years: {
          FY: [
            { name: "Principles of Management" },
            { name: "Financial Accounting I" },
            { name: "Microeconomics / Economics I" },
            { name: "Business Communication / Soft Skills" }
          ],
          SY: [
            { name: "Organizational Behavior" },
            { name: "Marketing Principles" },
            { name: "Statistics for Business" },
            { name: "Human Resource / Operations Basics" }
          ],
          TY: [
            { name: "Strategic Management" },
            { name: "Business Finance / Investment" },
            { name: "Project / Case Studies" },
            { name: "Electives (e.g. Digital Marketing, Entrepreneurship etc.)" }
          ]
        }
      }
    ]
  };

  const rdn_arts = {
    college: "R. D. National College, Bandra West",
    name: "Arts / Humanities",
    courses: [
      {
        name: "B.A (General)",
        years: {
          FY: [
            { name: "English / Communication Skills" },
            { name: "Optional Subject A (e.g. History / Political Science)" },
            { name: "Optional Subject B (e.g. Economics / Psychology)" },
            { name: "Language / Second Language / Foundation Course" }
          ],
          SY: [
            { name: "Core Subject A" },
            { name: "Core Subject B" },
            { name: "Electives / Minor Subjects" },
            { name: "Foundation / Soft Skills / Communication" }
          ],
          TY: [
            { name: "Advanced Topics / Specialization in chosen subjects" },
            { name: "Dissertation / Project Work / Seminar" },
            { name: "Electives / Research Methodologies" },
            { name: "Practical / Presentation / Field Work (if any)" }
          ]
        }
      },
      {
        name: "B.A Multimedia & Mass Communication",
        years: {
          FY: [
            { name: "Introduction to Communication / Media Studies" },
            { name: "Basics of Journalism" },
            { name: "English / Writing Skills" },
            { name: "Elective / Social Science Subject" }
          ],
          SY: [
            { name: "Audio / Video Production Basics" },
            { name: "Media Ethics / Law" },
            { name: "Reporting / Editing Skills" },
            { name: "Electives (Design / Photography etc.)" }
          ],
          TY: [
            { name: "Advertising / PR / Digital Media" },
            { name: "Project / Internship in Media Houses" },
            { name: "Specialization Electives (Film, Broadcast etc.)" },
            { name: "Research / Presentation / Portfolio" }
          ]
        }
      }
    ]
  };

  // Mithibai College, Vile Parle
  const mith_arts = {
    college: "Mithibai College ,Vile Parle",
    name: "Arts / Humanities",
    courses: [
      {
        name: "B.A. (General) – Economics / English / Gujarati / Hindi / Philosophy / Political Science / Psychology / Sociology",
        years: {
          FY: [
            { name: "Compulsory English / Communication Skills" },
            { name: "Foundation Course (Environmental Studies / Soft Skills)" },
            { name: "Core Subject I (one chosen from Economics / English etc.)" },
            { name: "Core Subject II / Optional Subject" }
          ],
          SY: [
            { name: "Continuation of Core Subjects" },
            { name: "Optional Subject(s)" },
            { name: "Seminar / Project (if applicable)" },
            { name: "Generic Elective / Open Elective" }
          ],
          TY: [
            { name: "Advanced Topics in Chosen Subject(s)" },
            { name: "Electives / Specialization Papers" },
            { name: "Project / Dissertation / Seminar" },
            { name: "Generic / Open Elective" }
          ]
        }
      },
      {
        name: "B.A.M.M.C. (Multimedia & Mass Communication)",
        years: {
          FY: [
            { name: "Introduction to Mass Communication / Media Basics" },
            { name: "English / Writing Skills" },
            { name: "Optional / Foundation Subject" },
            { name: "Language / Other Core Subject" }
          ],
          SY: [
            { name: "Media Laws & Ethics" },
            { name: "Reporting / Editing / Production Basics" },
            { name: "Audio-Visual Communication / Media Technology" },
            { name: "Elective / Generic Elective" }
          ],
          TY: [
            { name: "Advertising / Public Relations / Digital Media" },
            { name: "Project / Internship / Portfolio" },
            { name: "Advanced Electives" },
            { name: "Seminar / Major Paper" }
          ]
        }
      }
    ]
  };

  const mith_commerce = {
    college: "Mithibai College ,Vile Parle",
    name: "Commerce & Management",
    courses: [
      {
        name: "B.Com (General) / Accounting & Finance / Financial Markets / Banking & Insurance / Management & Finance",
        years: {
          FY: [
            { name: "Financial Accounting I" },
            { name: "Business Economics / Microeconomics" },
            { name: "Business Law / Organisation" },
            { name: "English / Communication Skills" }
          ],
          SY: [
            { name: "Corporate Accounting / Cost Accounting" },
            { name: "Business Statistics / Mathematics" },
            { name: "Finance / Banking Basics" },
            { name: "Optional / Elective Papers" }
          ],
          TY: [
            { name: "Advanced Accounting / Auditing" },
            { name: "Taxation / Corporate Finance / Stock Markets" },
            { name: "Project / Dissertation / Case Study" },
            { name: "Electives / Specialization Papers" }
          ]
        }
      },
      {
        name: "B.M.S. (Bachelor of Management Studies)",
        years: {
          FY: [
            { name: "Principles of Management" },
            { name: "Business Communication" },
            { name: "English" },
            { name: "Basic Accounting / Economics" }
          ],
          SY: [
            { name: "Organizational Behaviour" },
            { name: "Marketing Principles" },
            { name: "Business Statistics / Quantitative Techniques" },
            { name: "Elective / Optional Subject" }
          ],
          TY: [
            { name: "Strategic Management / Business Policy" },
            { name: "Finance / Investment / Banking" },
            { name: "Project / Internship / Case Study" },
            { name: "Electives / Advanced Topics" }
          ]
        }
      }
    ]
  };

  const mith_science = {
    college: "Mithibai College ,Vile Parle",
    name: "Science",
    courses: [
      {
        name: "B.Sc. (Computer Science)",
        years: {
          FY: [
            { name: "Programming / Fundamentals of Computing" },
            { name: "Mathematics I / Statistics" },
            { name: "Basic Science (Physics / Chemistry)" },
            { name: "English / Soft Skills" }
          ],
          SY: [
            { name: "Data Structures / Algorithms" },
            { name: "Discrete Mathematics / Mathematical Foundations" },
            { name: "Digital Logic / Computer Architecture" },
            { name: "Laboratory Practicals" }
          ],
          TY: [
            { name: "Operating Systems / Systems Software" },
            { name: "Database / Web / Emerging Technologies" },
            { name: "Project / Research Work" },
            { name: "Electives / Advanced Papers" }
          ]
        }
      },
      {
        name: "B.Sc. (Biotechnology / Biochemistry / Botany / Microbiology / Zoology / Mathematics / Statistics / Physics / Applied Statistics & Data Analytics / Psychology / Health Sciences)",
        years: {
          FY: [
            { name: "Core Subject I (e.g. Biology / Chemistry / Mathematics etc.)" },
            { name: "Core Subject II" },
            { name: "Basic Supporting Subjects" },
            { name: "English / Soft Skills" }
          ],
          SY: [
            { name: "Intermediate Subject Papers / Practical Lab Work" },
            { name: "Electives / Optional Subjects" },
            { name: "Generic / Open Electives" },
            { name: "Seminar / Project (if provided)" }
          ],
          TY: [
            { name: "Advanced / Major Subject Papers" },
            { name: "Research Project / Dissertation / Lab-Intensive Work" },
            { name: "Electives / Specialization" },
            { name: "Generic / Open Elective" }
          ]
        }
      }
    ]
  };

  // Upsert instead of delete to preserve existing data between runs
  const payloads = [rdn_science, rdn_commerce, rdn_arts, mith_arts, mith_commerce, mith_science];
  
  // SIES College of Arts, Science & Commerce, Sion (West)
  const sies_science = {
    college: "SIES College of Arts, Science & Commerce, Sion (West)",
    name: "Science",
    courses: [
      {
        name: "B.Sc",
        years: {
          FY: [
            { name: "Foundation Course - Paper I (compulsory)" },
            { name: "Group of 3 subjects (choose 2 units each) from subject combinations among Physics, Chemistry, Mathematics, Statistics, Botany, Zoology, Microbiology, Biotechnology, Computer Science" }
          ],
          SY: [
            { name: "Foundation Course - Paper II (compulsory)" },
            { name: "Core Subject (3 units) + Another Subject" }
          ],
          TY: [
            { name: "Either one subject of 6 units under Group I" },
            { name: "Or any two subjects of 3 units each under Group II" },
            { name: "Applied Component (2 units) compulsory for all: pick one among Electronic Instrumentation; Fishery Biology; Horticulture & Gardening; Computer Programming; Drugs & Dyes; Web Design & Applications" }
          ]
        }
      }
    ]
  };

  const sies_arts = {
    college: "SIES College of Arts, Science & Commerce, Sion (West)",
    name: "Arts / Humanities",
    courses: [
      {
        name: "B.A",
        years: {
          FY: [
            { name: "Compulsory English: Communication Skills in English" },
            { name: "Compulsory Language: Marathi or Hindi or French" },
            { name: "Foundation Course – Paper I" },
            { name: "Choose three subject Groups from defined Groups among Economics, Politics, Psychology, History, Philosophy, Hindi, English" }
          ],
          SY: [
            { name: "Foundation Course - Paper II" },
            { name: "Applied Component (Any one): Elementary Quantitative Techniques; Population Studies; General Introduction to Law; Comparative Study of Religion; Travel & Tourism; Computer Programming" },
            { name: "Choose subject groups similar to FY continuing major/minor subjects" }
          ],
          TY: [
            { name: "Major Subject (6 unit subject) OR combination of two 3-unit subjects" },
            { name: "Optional / Ancillary as per choice (if offered)" }
          ]
        }
      }
    ]
  };

  const sies_commerce = {
    college: "SIES College of Arts, Science & Commerce, Sion (West)",
    name: "Commerce & Management",
    courses: [
      {
        name: "B.Com",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "BMS",
        years: { FY: [], SY: [], TY: [] }
      }
    ]
  };

  payloads.push(sies_science, sies_arts, sies_commerce);

  // K.J. Somaiya Vidyavihar
  const somaiya_arts = {
    college: "K.J somaiya Vidhya vihar",
    name: "Arts / Humanities",
    courses: [
      {
        name: "B.A. (Bachelor of Arts)",
        years: {
          FY: [
            { name: "Communication Skills in English" },
            { name: "Foundation Course – Paper I" },
            { name: "Sports / Foreign Language / NCC / Optional Language" },
            { name: "Compulsory Language (Marathi / Sanskrit etc.)" },
            { name: "Choose either: 2 Social Sciences + 1 Language OR 2 Languages + 1 Social Science" }
          ],
          SY: [
            { name: "Foundation Course – Paper II" },
            { name: "Applied Component Subject (e.g. Journalism / Mass Communication etc.)" },
            { name: "Further Papers in chosen Social Science / Language subjects" },
            { name: "Language / Ancillary Papers" }
          ],
          TY: [
            { name: "6 papers in one subject OR 3+3 papers in two subjects" },
            { name: "Advanced / Specialization papers in major subject(s)" },
            { name: "Electives across Arts / Languages" },
            { name: "Any open elective / additional papers as per autonomous curriculum" }
          ]
        }
      },
      {
        name: "B.A. Political Science",
        years: {
          FY: [
            { name: "Indian Political System (Paper I, Sem I)" },
            { name: "Indian Political Process (Sem II)" },
            { name: "India in World Politics (Sem II)" },
            { name: "Public Policy in India" },
            { name: "Political Process in the United States" },
            { name: "Media and Electoral Processes" }
          ],
          SY: [
            { name: "Core / Elective papers continuing Political Science major" },
            { name: "Other Social Science / Language subjects (ancillary / electives)" },
            { name: "Applied Components / Interdisciplinary Electives" },
            { name: "Seminar / Project / Study Visits (if applicable)" }
          ],
          TY: [
            { name: "Advanced Political Science Papers (theory + application)" },
            { name: "Optional elective papers in related disciplines" },
            { name: "Major specialization / optional projects" },
            { name: "Capstone or major research paper / dissertation (if part of curriculum)" }
          ]
        }
      }
    ]
  };

  const somaiya_commerce = {
    college: "K.J somaiya Vidhya vihar",
    name: "Commerce",
    courses: [
      {
        name: "B.Com (Bachelor of Commerce)",
        years: {
          FY: [
            { name: "Accountancy and Financial Management I" },
            { name: "Introduction to Business" },
            { name: "Business Economics I" },
            { name: "Business Communication I" },
            { name: "Environmental Studies I" },
            { name: "Foundation Course I" },
            { name: "Mathematical & Statistical Techniques I" }
          ],
          SY: [
            { name: "Accountancy and Financial Management II" },
            { name: "Introduction to Services / Commerce II" },
            { name: "Business Economics II" },
            { name: "Business Communication II" },
            { name: "Environmental Studies II" },
            { name: "Foundation Course II" },
            { name: "Mathematical & Statistical Techniques II" }
          ],
          TY: [
            { name: "Financial Accounting & Auditing – advanced papers" },
            { name: "Cost Accounting / Management Accounting" },
            { name: "Direct & Indirect Taxes" },
            { name: "Electives ‒ e.g. Marketing & HR Management" },
            { name: "Export Marketing / Investment Analysis / Portfolio Management (Electives)" },
            { name: "Computer Systems & Application Elective" }
          ]
        }
      }
    ]
  };

  const somaiya_science = {
    college: "K.J somaiya Vidhya vihar",
    name: "Science",
    courses: [
      {
        name: "B.Sc (Bachelor of Science)",
        years: {
          FY: [
            { name: "Core subjects (chosen science discipline)" },
            { name: "Lab / Practical components for core science subjects" },
            { name: "English / Communication / Supporting subjects" },
            { name: "Computer literacy / basic computing skills" }
          ],
          SY: [
            { name: "Intermediate theory papers in chosen discipline" },
            { name: "Greater weight on practicals / labs" },
            { name: "Optional / Elective Science subjects" },
            { name: "Interdisciplinary / skill‐enhancement subjects (if offered)" }
          ],
          TY: [
            { name: "Advanced papers in major science subject(s)" },
            { name: "Project / Research / Dissertation component" },
            { name: "Elective / open science papers" },
            { name: "Supporting / ancillary subjects" }
          ]
        }
      }
    ]
  };

  payloads.push(somaiya_arts, somaiya_commerce, somaiya_science);

  // Patkar-Varde College , Goregaon
  const patkar_arts = {
    college: "Patkar-Varde College , Goregaon",
    name: "Arts / Humanities",
    courses: [
      {
        name: "B.A. (Bachelor of Arts)",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.A. Mass Media / B.M.M.",
        years: { FY: [], SY: [], TY: [] }
      }
    ]
  };

  const patkar_commerce = {
    college: "Patkar-Varde College , Goregaon",
    name: "Commerce & Management",
    courses: [
      {
        name: "B.Com (General)",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Com – Accounting & Finance (BAF)",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Com – Banking & Insurance (BBI)",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Com – Management Studies (BMS)",
        years: { FY: [], SY: [], TY: [] }
      }
    ]
  };

  const patkar_science = {
    college: "Patkar-Varde College , Goregaon",
    name: "Science",
    courses: [
      {
        name: "B.Sc – Data Science & Business Analytics",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Computer Science",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Information Technology",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Biotechnology",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Microbiology",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Aviation",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "B.Sc – Pharma / Drug Science",
        years: { FY: [], SY: [], TY: [] }
      }
    ]
  };

  const patkar_pg = {
    college: "Patkar-Varde College , Goregaon",
    name: "Postgraduate",
    courses: [
      {
        name: "M.A – Mass Communication & Journalism",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "M.A – Psychology / Public Relations / etc.",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "M.Com – Advanced Accountancy",
        years: { FY: [], SY: [], TY: [] }
      },
      {
        name: "M.Sc – Computer Science / Data Science & Big Data Analytics etc.",
        years: { FY: [], SY: [], TY: [] }
      }
    ]
  };

  payloads.push(patkar_arts, patkar_commerce, patkar_science, patkar_pg);

  // Merge helper: add missing items without overwriting existing ones
  function mergeUniqueSubjects(target = [], source = []) {
    const existing = new Set(target.map(s => (s?.name || '').toLowerCase()));
    for (const s of source) {
      const key = (s?.name || '').toLowerCase();
      if (key && !existing.has(key)) {
        target.push({ name: s.name, papers: Array.isArray(s.papers) ? s.papers : [] });
        existing.add(key);
      }
    }
    return target;
  }

  function mergeYears(targetYears = {}, sourceYears = {}) {
    const out = { ...targetYears };
    for (const [yearKey, subjects] of Object.entries(sourceYears)) {
      if (!Array.isArray(out[yearKey])) out[yearKey] = [];
      out[yearKey] = mergeUniqueSubjects(out[yearKey], Array.isArray(subjects) ? subjects : []);
    }
    return out;
  }

  function mergeCourses(targetCourses = [], sourceCourses = []) {
    const out = [...targetCourses];
    for (const src of sourceCourses) {
      const idx = out.findIndex(c => String(c.name).toLowerCase() === String(src.name).toLowerCase());
      if (idx === -1) {
        out.push({ name: src.name, years: src.years || {} });
      } else {
        out[idx] = {
          name: out[idx].name,
          years: mergeYears(out[idx].years || {}, src.years || {})
        };
      }
    }
    return out;
  }

  for (const doc of payloads) {
    const filter = { college: doc.college || { $exists: false }, name: doc.name };
    const existing = await Department.findOne(filter);
    if (!existing) {
      await Department.create(doc);
    } else {
      // Non-destructive merge
      const mergedCourses = mergeCourses(existing.courses || [], doc.courses || []);
      existing.courses = mergedCourses;
      await existing.save();
    }
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
