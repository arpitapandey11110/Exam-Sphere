export const collegeData = {
  streams: [
    {
      id: 'arts',
      name: 'Arts',
      icon: 'Palette',
      variant: 'arts',
      courses: [
        {
          id: 'ba-economics',
          name: 'BA Economics',
          subjects: {
            'First Year': ['Microeconomics', 'Macroeconomics', 'Statistics', 'English', 'Environmental Studies'],
            'Second Year': ['International Economics', 'Public Finance', 'Economic Development', 'Research Methodology', 'Computer Applications'],
            'Third Year': ['Industrial Economics', 'Agricultural Economics', 'Project Work', 'Econometrics', 'Indian Economy']
          }
        },
        {
          id: 'ba-english',
          name: 'BA English Literature',
          subjects: {
            'First Year': ['Poetry', 'Prose', 'Drama', 'Grammar & Composition', 'Indian Writing'],
            'Second Year': ['Modern Literature', 'Literary Criticism', 'World Literature', 'Creative Writing', 'Media Studies'],
            'Third Year': ['Contemporary Literature', 'Research Project', 'Comparative Literature', 'Women Writers', 'Post-Colonial Literature']
          }
        },
        {
          id: 'ba-hindi',
          name: 'BA Hindi Literature',
          subjects: {
            'First Year': ['काव्य', 'गद्य', 'व्याकरण', 'छंदशास्त्र', 'भाषाविज्ञान'],
            'Second Year': ['आधुनिक हिंदी साहित्य', 'आलोचना', 'अनुवाद', 'रचनात्मक लेखन', 'मीडिया अध्ययन'],
            'Third Year': ['समकालीन साहित्य', 'शोध प्रबंध', 'तुलनात्मक साहित्य', 'लोक साहित्य', 'प्रयोजनमूलक हिंदी']
          }
        },
        {
          id: 'ba-mass-media',
          name: 'BA Mass Media & Communication',
          subjects: {
            'First Year': ['Introduction to Mass Communication', 'Print Media', 'Electronic Media', 'Communication Skills', 'Media Laws'],
            'Second Year': ['Digital Media', 'Advertising', 'Public Relations', 'Film Studies', 'Media Research'],
            'Third Year': ['Media Management', 'Documentary Production', 'Internship', 'Portfolio Development', 'Media Ethics']
          }
        },
        {
          id: 'ba-political-science',
          name: 'BA Political Science',
          subjects: {
            'First Year': ['Political Theory', 'Indian Constitution', 'Comparative Politics', 'International Relations', 'Public Administration'],
            'Second Year': ['Indian Political System', 'Political Parties', 'Foreign Policy', 'Human Rights', 'Local Governance'],
            'Third Year': ['Contemporary Issues', 'Research Methodology', 'Dissertation', 'Political Economy', 'Globalization']
          }
        },
        {
          id: 'ba-psychology',
          name: 'BA Psychology',
          subjects: {
            'First Year': ['General Psychology', 'Developmental Psychology', 'Research Methods', 'Statistics', 'Biological Psychology'],
            'Second Year': ['Cognitive Psychology', 'Social Psychology', 'Personality Psychology', 'Abnormal Psychology', 'Psychological Testing'],
            'Third Year': ['Clinical Psychology', 'Counseling Psychology', 'Industrial Psychology', 'Research Project', 'Practicum']
          }
        }
      ]
    },
    {
      id: 'science',
      name: 'Science',
      icon: 'Atom',
      variant: 'science',
      courses: [
        {
          id: 'bsc-biotech',
          name: 'BSc Biotechnology',
          subjects: {
            'First Year': ['Cell Biology', 'Biochemistry', 'Microbiology', 'Mathematics', 'Chemistry'],
            'Second Year': ['Molecular Biology', 'Genetics', 'Immunology', 'Biostatistics', 'Environmental Science'],
            'Third Year': ['Industrial Biotechnology', 'Research Project', 'Bioinformatics', 'Bioethics', 'Internship']
          }
        },
        {
          id: 'bsc-cs',
          name: 'BSc Computer Science',
          subjects: {
            'First Year': ['Programming in C', 'Digital Logic', 'Mathematics', 'Computer Fundamentals', 'English'],
            'Second Year': ['Data Structures', 'Database Management', 'Object Oriented Programming', 'Web Technologies', 'Software Engineering'],
            'Third Year': ['Machine Learning', 'Computer Networks', 'Project Work', 'Cyber Security', 'Mobile Computing']
          }
        },
        {
          id: 'bsc-botany',
          name: 'BSc Botany',
          subjects: {
            'First Year': ['Plant Diversity', 'Cell Biology', 'Plant Anatomy', 'Chemistry', 'Environmental Studies'],
            'Second Year': ['Plant Physiology', 'Genetics', 'Ecology', 'Plant Pathology', 'Biochemistry'],
            'Third Year': ['Plant Breeding', 'Research Project', 'Economic Botany', 'Conservation Biology', 'Biotechnology']
          }
        },
        {
          id: 'bsc-chemistry',
          name: 'BSc Chemistry',
          subjects: {
            'First Year': ['Inorganic Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Mathematics', 'Physics'],
            'Second Year': ['Analytical Chemistry', 'Environmental Chemistry', 'Industrial Chemistry', 'Instrumental Analysis', 'Chemical Bonding'],
            'Third Year': ['Research Project', 'Green Chemistry', 'Medicinal Chemistry', 'Polymer Chemistry', 'Spectroscopy']
          }
        },
        {
          id: 'bsc-physics',
          name: 'BSc Physics',
          subjects: {
            'First Year': ['Mechanics', 'Waves & Oscillations', 'Thermodynamics', 'Mathematics', 'Chemistry'],
            'Second Year': ['Electromagnetism', 'Optics', 'Modern Physics', 'Electronics', 'Mathematical Physics'],
            'Third Year': ['Quantum Mechanics', 'Research Project', 'Solid State Physics', 'Nuclear Physics', 'Astrophysics']
          }
        },
        {
          id: 'bsc-zoology',
          name: 'BSc Zoology',
          subjects: {
            'First Year': ['Animal Diversity', 'Cell Biology', 'Comparative Anatomy', 'Chemistry', 'Environmental Studies'],
            'Second Year': ['Animal Physiology', 'Genetics', 'Ecology', 'Evolution', 'Biochemistry'],
            'Third Year': ['Applied Zoology', 'Research Project', 'Animal Behavior', 'Conservation Biology', 'Biotechnology']
          }
        },
        {
          id: 'bsc-it',
          name: 'BSc Information Technology',
          subjects: {
            'First Year': ['Programming Fundamentals', 'Computer Systems', 'Mathematics', 'Digital Electronics', 'Communication Skills'],
            'Second Year': ['Data Structures', 'Database Systems', 'Web Development', 'Operating Systems', 'Software Engineering'],
            'Third Year': ['Network Security', 'Cloud Computing', 'Project Development', 'Mobile App Development', 'Internship']
          }
        },
        {
          id: 'bsc-maths-stats',
          name: 'BSc Mathematics & Statistics',
          subjects: {
            'First Year': ['Calculus', 'Algebra', 'Descriptive Statistics', 'Computer Programming', 'Physics'],
            'Second Year': ['Real Analysis', 'Probability Theory', 'Inferential Statistics', 'Operations Research', 'Numerical Methods'],
            'Third Year': ['Mathematical Statistics', 'Research Project', 'Time Series Analysis', 'Econometrics', 'Data Science']
          }
        }
      ]
    },
    {
      id: 'commerce',
      name: 'Commerce',
      icon: 'Calculator',
      variant: 'commerce',
      courses: [
        {
          id: 'bcom',
          name: 'BCom',
          subjects: {
            'First Year': ['Financial Accounting', 'Business Organization', 'Business Economics', 'Business Mathematics', 'English'],
            'Second Year': ['Cost Accounting', 'Corporate Accounting', 'Income Tax', 'Business Law', 'Banking'],
            'Third Year': ['Auditing', 'Financial Management', 'Management Accounting', 'Project Work', 'Entrepreneurship']
          }
        },
        {
          id: 'bcom-accountancy',
          name: 'BCom Accountancy',
          subjects: {
            'First Year': ['Principles of Accounting', 'Business Communication', 'Economics', 'Statistics', 'Computer Applications'],
            'Second Year': ['Advanced Accounting', 'Cost & Management Accounting', 'Taxation', 'Financial Markets', 'Business Environment'],
            'Third Year': ['Auditing & Assurance', 'Financial Statement Analysis', 'International Accounting', 'Research Project', 'Ethics']
          }
        },
        {
          id: 'bcom-af',
          name: 'BCom Accounting & Finance',
          subjects: {
            'First Year': ['Financial Accounting', 'Principles of Finance', 'Business Economics', 'Statistics', 'Business Communication'],
            'Second Year': ['Corporate Finance', 'Investment Analysis', 'Banking & Insurance', 'International Finance', 'Risk Management'],
            'Third Year': ['Portfolio Management', 'Financial Derivatives', 'Project Finance', 'Internship', 'Comprehensive Project']
          }
        },
        {
          id: 'bcom-ms',
          name: 'BCom Management Studies',
          subjects: {
            'First Year': ['Principles of Management', 'Organizational Behavior', 'Business Economics', 'Accounting', 'Business Communication'],
            'Second Year': ['Marketing Management', 'Human Resource Management', 'Operations Management', 'Financial Management', 'Business Law'],
            'Third Year': ['Strategic Management', 'International Business', 'Entrepreneurship', 'Project Management', 'Case Studies']
          }
        }
      ]
    }
  ],
  
  questionPapers: ['2024', '2023', '2022', '2021', '2020']
};
