
import { Subject, LevelInfo } from './types';

export const INITIAL_SUBJECTS: Record<string, Subject> = {
  'Physics 1st': {
    id: 'phys1',
    name: 'Physics 1st',
    chapters: {
      'Ch1: Physical World': ['T-01: Dimensional Analysis', 'T-02: Measurement Errors', 'T-03: Instruments', 'T-04: Unit Conversion'],
      'Ch2: Vectors': ['T-01: Vector Types', 'T-02: Resultant', 'T-03: Resolution', 'T-04: River Problems', 'T-05: Subtraction', 'T-06: Multiple Vectors', 'T-07: Dot Product', 'T-08: Direction Cosines', 'T-09: Cross Product', 'T-10: Vector Calculus'],
      'Ch3: Kinematics': ['T-01: Equations of Motion', 'T-02: Vertical Motion', 'T-03: Projectile', 'T-04: Circular Motion'],
      'Ch4: Mechanics': ['T-01: Newton\'s Laws', 'T-02: Forces', 'T-03: Impulse', 'T-04: Momentum', 'T-05: Lift', 'T-06: Moment of Inertia', 'T-07: Torque', 'T-08: Angular Momentum', 'T-09: Angular Kinetics', 'T-10: Centripetal Force', 'T-11: Banking'],
      'Ch5: Work & Energy': ['T-01: Work Done', 'T-02: Spring Force', 'T-03: PE & KE', 'T-04: Work-Energy Theorem', 'T-05: Power', 'T-06: Well Problems'],
      'Ch6: Gravitation': ['T-01: Newton\'s Law', 'T-02: Gravity', 'T-03: Gravitational Field', 'T-04: Kepler\'s Laws', 'T-05: Escape Velocity', 'T-06: Satellites'],
      'Ch7: Matter Properties': ['T-01: Young\'s Modulus', 'T-02: Rigidity', 'T-03: Bulk Modulus', 'T-04: Poisson\'s Ratio', 'T-05: Thermal Stress', 'T-06: Energy', 'T-07: Viscosity', 'T-08: Surface Tension', 'T-09: Surface Energy', 'T-10: Capillarity', 'T-11: Pressure'],
      'Ch8: Periodic Motion': ['T-01: SHM Differential', 'T-02: SHM', 'T-03: Pendulum', 'T-04: Energy in SHM', 'T-05: Springs'],
      'Ch9: Waves': ['T-01: Wave Quantities', 'T-02: Progressive Waves', 'T-03: Beats & Sound', 'T-04: Strings'],
      'Ch10: Ideal Gas': ['T-01: Gas Laws', 'T-02: Ideal Gas Equation', 'T-03: RMS Speed', 'T-04: Kinetic Theory', 'T-05: Mean Free Path', 'T-06: Humidity']
    }
  },
  'Physics 2nd': {
    id: 'phys2',
    name: 'Physics 2nd',
    chapters: {
      'Ch1: Thermodynamics': ['T-01: Zeroth Law', 'T-02: First Law', 'T-03: Energy Conversion', 'T-04: Processes', 'T-05: Specific Heat', 'T-06: Second Law', 'T-07: Refrigerators', 'T-08: Entropy'],
      'Ch2: Electrostatics': ['T-01: Coulomb\'s Law', 'T-02: Electric Field', 'T-03: Potential', 'T-04: Dipole', 'T-05: Capacitors', 'T-06: Capacitance', 'T-07: Energy'],
      'Ch3: Current': ['T-01: Resistance', 'T-02: Ohm\'s Law', 'T-03: Cells', 'T-04: Kirchhoff\'s Laws', 'T-05: Wheatstone Bridge', 'T-06: Meter Bridge', 'T-07: Instruments', 'T-08: Joule\'s Law', 'T-09: Power'],
      'Ch4: Magnetism': ['T-01: Charged Particles', 'T-02: Magnetic Field', 'T-03: Force on Conductor', 'T-04: Torque', 'T-05: Induction'],
      'Ch5: EM Induction': ['T-01: Faraday\'s Law', 'T-02: Induction Types', 'T-03: AC', 'T-04: Transformers'],
      'Ch6: Optics': ['T-01: Reflection & Refraction', 'T-02: Prisms', 'T-03: Lenses', 'T-04: Lens Power', 'T-05: Microscope', 'T-06: Compound Microscope', 'T-07: Telescope'],
      'Ch7: Physical Optics': ['T-01: Interference', 'T-02: Diffraction', 'T-03: Polarization', 'T-04: Poynting Vector'],
      'Ch8: Modern Physics': ['T-01: Relativity Length', 'T-02: Relativity Time', 'T-03: Mass-Energy', 'T-04: Photons', 'T-05: X-rays', 'T-06: Photoelectric', 'T-07: De Broglie', 'T-08: Lorentz', 'T-09: Compton Effect'],
      'Ch9: Nuclear': ['T-01: Hydrogen Atom', 'T-02: Transitions', 'T-03: Half-life', 'T-04: Binding Energy', 'T-05: Fission & Fusion'],
      'Ch10: Electronics': ['T-01: Semiconductors', 'T-02: Transistors', 'T-03: Number Systems', 'T-04: Logic Gates'],
      'Ch11: Astronomy': ['T-01: Universe Creation', 'T-02: Components']
    }
  },
  'Chemistry 1st': {
    id: 'chem1',
    name: 'Chemistry 1st',
    chapters: {
      'Ch1: Lab Safety': ['T-01: Safety Rules', 'T-02: Concentration', 'T-03: Heating', 'T-04: Storage'],
      'Ch2: Qualitative': ['T-01: Atoms & Isotopes', 'T-02: Atomic Models', 'T-03: Quantum Numbers', 'T-04: Spectroscopy', 'T-05: Solubility', 'T-06: Precipitation', 'T-07: Ion ID', 'T-08: Chromatography'],
      'Ch3: Periodic Table': ['T-01: Block Elements', 'T-02: Periodic Properties 1', 'T-03: Periodic Properties 2', 'T-04: Covalent Bonding', 'T-05: Oxides', 'T-06: Complex Compounds', 'T-07: Hybridization', 'T-08: Polarization', 'T-09: H-bonding'],
      'Ch4: Chemical Change': ['T-01: Reaction Rate', 'T-02: Le Chatelier', 'T-03: Equilibrium', 'T-04: pH', 'T-05: Buffers', 'T-06: Thermochemistry'],
      'Ch5: Working Chemistry': ['T-01: Preservatives', 'T-02: Vinegar', 'T-03: Canning', 'T-04: Solutions', 'T-05: Toiletries']
    }
  },
  'Chemistry 2nd': {
    id: 'chem2',
    name: 'Chemistry 2nd',
    chapters: {
      'Ch1: Environmental': ['T-01: Gas Laws', 'T-02: Partial Pressure', 'T-03: Diffusion', 'T-04: Kinetic Theory', 'T-05: Real Gases', 'T-06: Water Purity', 'T-07: Atmosphere'],
      'Ch2: Organic': ['T-01: Classification', 'T-02: Isomerism', 'T-03: Hydrocarbons', 'T-04: Alkyl Halides', 'T-05: Alcohols', 'T-06: Aldehydes', 'T-07: Organic Acids', 'T-08: Amines', 'T-10: Electrophilic', 'T-11: Polymers'],
      'Ch3: Quantitative': ['T-01: Calculations', 'T-02: Concentration', 'T-03: Titration', 'T-04: Redox Balance', 'T-05: Redox Titration', 'T-06: Iodometry', 'T-07: Purity', 'T-08: Beer-Lambert'],
      'Ch4: Electrochemistry': ['T-01: Conductivity', 'T-02: Faraday\'s Laws', 'T-03: Cells', 'T-04: Potential', 'T-05: Nernst', 'T-06: Batteries'],
      'Ch5: Economic': ['T-01: Coal Resources', 'T-02: Pollutants', 'T-03: Nano Technology']
    }
  },
  'Math 1st': {
    id: 'math1',
    name: 'Math 1st',
    chapters: {
      'Ch1: Matrices': ['T-01: Types', 'T-02: Addition', 'T-03: Trace', 'T-04: Multiplication', 'T-05: Equality', 'T-06: Minors', 'T-07: Inverse', 'T-08: Identity', 'T-09: Unknowns', 'T-10: Linear Equations'],
      'Ch2: Vectors': ['T-01: Types', 'T-02: Dot Product', 'T-03: Angle', 'T-04: Projection', 'T-05: Cross Product', 'T-06: Unit Vectors', 'T-07: Collinearity'],
      'Ch3: Lines': ['T-01: Coordinates', 'T-02: Distance', 'T-03: Division', 'T-04: Area', 'T-05: Displacement', 'T-06: Slopes', 'T-07: Equations', 'T-08: Parallel Lines', 'T-09: Point Distance', 'T-10: Line Distance', 'T-11: Centroid', 'T-12: Angle', 'T-13: Bisectors', 'T-14: Reflection', 'T-15: Misc'],
      'Ch4: Circles': ['T-01: Center & Radius', 'T-02: Conditions', 'T-03: Polar Form', 'T-04: Through Points', 'T-05: Intercepts', 'T-06: Diameter', 'T-07: Three Points', 'T-08: Center on Line', 'T-09: Intersection', 'T-10: Tangents', 'T-11: Tangent Equations', 'T-12: Touching Axes', 'T-13: External Tangents', 'T-14: Relative Position', 'T-15: Radical Axis', 'T-16: Chord Midpoint', 'T-17: Circumscribe'],
      'Ch5: Permutations': ['T-01: Pr & Cr', 'T-02: Permutations', 'T-03: Words', 'T-04: Selection', 'T-05: Combinations', 'T-06: Committees', 'T-07: Word Formation', 'T-08: Geometry'],
      'Ch6: Trig Ratios': ['T-01: Angles & Arc', 'T-02: Conversions', 'T-03: Domain & Range', 'T-04: Periodic'],
      'Ch7: Trig Angles': ['T-01: Associated Angles', 'T-02: Series', 'T-03: Compound', 'T-04: Multiple', 'T-05: Sub-multiple', 'T-06: Identities', 'T-07: Triangle Parts', 'T-08: Conditions', 'T-09: Triangle Nature'],
      'Ch8: Functions': ['T-01: Value', 'T-02: One-to-one', 'T-03: Inverse', 'T-04: Domain & Range', 'T-05: Composite', 'T-06: Graphs'],
      'Ch9: Differentiation': ['T-01: Continuity', 'T-02: Limits', 'T-03: Conjugate', 'T-04: Special Limits', 'T-05: Trig Limits', 'T-06: Exponential', 'T-07: Infinity Limits', 'T-08: Exponential Form', 'T-09: First Principles', 'T-10: Simplification', 'T-11: Chain Rule', 'T-12: Product Rule', 'T-13: Inverse Trig', 'T-14: Logarithms', 'T-15: Implicit', 'T-16: Successive', 'T-17: Tangents', 'T-18: Increasing', 'T-19: Maxima', 'T-20: Applications'],
      'Ch10: Integration': ['T-01: Basic', 'T-02: ax+b', 'T-03: Substitution', 'T-04: f\'/f', 'T-05: Exponential', 'T-06: Trig Products', 'T-07: Rational', 'T-08: sin^m cos^n', 'T-09: Quadratic', 'T-10: Combinations', 'T-11: Radicals', 'T-12: By Parts', 'T-13: e^x forms', 'T-14: Partial Fractions', 'T-15: Definite', 'T-16: Area', 'T-17: Misc']
    }
  },
  'Math 2nd': {
    id: 'math2',
    name: 'Math 2nd',
    chapters: {
      'Ch1: Real Numbers': ['T-01: Properties', 'T-02: Absolute Value Inequalities', 'T-03: Solving Absolute Value', 'T-04: Absolute Value Proofs', 'T-05: Completeness Property', 'T-06: Single Variable Inequalities', 'T-07: Two Variable Inequalities'],
      'Ch2: Linear Programming': ['T-01: Formation & Importance', 'T-02: Bounded Solution Regions', 'T-03: Unbounded Solution Regions'],
      'Ch3: Complex Numbers': ['T-01: A+iB & Polar Forms', 'T-02: Modulus & Argument', 'T-03: Conjugate', 'T-04: Finding Roots', 'T-05: Powers of i', 'T-06: Cube Roots of Unity', 'T-07: Value & Proofs', 'T-08: Graphs & Geometry'],
      'Ch4: Polynomials': ['T-01: Identifying Polynomials', 'T-02: Discriminant & Nature', 'T-03: Roots & Coefficients', 'T-04: Root Relations', 'T-05: Finding Roots', 'T-06: Formation of Equations', 'T-07: Symmetric Expressions', 'T-08: Roots in Different Sets', 'T-09: Common Roots'],
      'Ch5: Binomial Expansion': ['T-01: Pascal\'s Triangle', 'T-02: Binomial Theorem', 'T-03: General Term', 'T-04: Independent Terms', 'T-05: Middle Term', 'T-06: Ratio of Coefficients', 'T-07: Equality of Coefficients', 'T-08: Infinite Series', 'T-09: Convergence', 'T-10: Sum of Coefficients'],
      'Ch6: Conics': ['T-01: Identifying Conics', 'T-02: Parabola Elements', 'T-03: Parabola Equations', 'T-04: Focal Distance', 'T-05: Ellipse Elements', 'T-06: Ellipse Equations', 'T-07: Hyperbola Elements', 'T-08: Hyperbola Equations', 'T-09: SP + S\'P = 2a', 'T-10: Asymptotes', 'T-11: Parametric Equations', 'T-12: Focus & Directrix', 'T-13: Tangents & Normals'],
      'Ch7: Inverse Trig': ['T-01: Graph Problems', 'T-02: Value Problems', 'T-03: Inverse Proofs', 'T-04: General Solutions', 'T-05: Square Roots', 'T-06: Quadratic Terms', 'T-07: a·cos + b·sin = c', 'T-08: Additive Form', 'T-09: Multiplicative Form', 'T-10: cot, tan, sec, csc'],
      'Ch8: Statics': ['T-01: Parallelogram Law', 'T-02: Sine Rule', 'T-03: Resultant Direction', 'T-04: Components Theorem', 'T-05: Composition & Resolution', 'T-06: Concurrent Forces Angles', 'T-07: Lami\'s Theorem', 'T-08: Three Forces Equilibrium', 'T-09: Like Parallel Forces', 'T-10: Triangle of Forces', 'T-11: Unlike Parallel Forces', 'T-12: Pressure & Reaction'],
      'Ch9: Motion in Plane': ['T-01: Parallelogram of Velocities', 'T-02: River Crossing', 'T-03: Uniform Motion', 'T-04: Catching Problems', 'T-05: Distance in nth Second', 'T-06: Train Collision', 'T-07: Penetration Distance', 'T-08: Relative Velocity', 'T-09: Free Fall', 'T-10: Well Depth', 'T-11: Vertical Throw Time', 'T-12: Max Height & Time', 'T-13: Dropping from Balloon', 'T-14: Two Objects Different Heights', 'T-15: Projectile at Angle α', 'T-16: Time, Height, Range', 'T-17: Projectile Over Wall', 'T-18: Projectile from Height h', 'T-19: Angles α & 90°-α', 'T-20: Grass Problems'],
      'Ch10: Dispersion & Probability': ['T-01: Dispersion & Range', 'T-02: Mean Deviation', 'T-03: Variance & Standard Deviation', 'T-04: Quartile Deviation', 'T-05: General Probability', 'T-06: Probability Trees', 'T-07: Multiplication Theorem', 'T-08: Permutations & Combinations']
    }
  },
  'Biology 1st': {
    id: 'bio1',
    name: 'Biology 1st',
    chapters: {
      'Ch1: Cell': ['T-01: Cell Structure', 'T-02: Membrane', 'T-03: Ribosome', 'T-04: Organelles', 'T-05: Mitochondria', 'T-06: Plastid', 'T-07: Centriole', 'T-08: Nucle nucleus', 'T-09: Nucleic Acid', 'T-10: Replication', 'T-11: Transcription', 'T-12: Genetic Code'],
      'Ch2: Division': ['T-01: Introduction', 'T-02: Cell Cycle', 'T-03: Mitosis', 'T-04: Meiosis', 'T-05: Crossing Over'],
      'Ch3: Chemistry': ['T-01: Carbohydrates', 'T-02: Polysaccharides', 'T-03: Amino Acids', 'T-04: Proteins', 'T-05: Lipids', 'T-06: Enzymes'],
      'Ch4: Microorganisms': ['T-01: Virus', 'T-02: Virus Importance', 'T-03: Viral Diseases', 'T-04: Bacteria', 'T-05: Bacteria Importance', 'T-06: Plasmodium'],
      'Ch5: Algae': ['T-01: Algae', 'T-02: Ulothrix', 'T-03: Fungi', 'T-04: Agaricus', 'T-05: Diseases', 'T-06: Lichen'],
      'Ch6: Plants': ['T-01: Bryophyta', 'T-02: Pteridophyta'],
      'Ch7: Seed Plants': ['T-01: Gymnosperms', 'T-02: Cycas', 'T-03: Angiosperms', 'T-04: Poaceae', 'T-05: Malvaceae'],
      'Ch8: Tissue': ['T-01: Meristematic', 'T-02: Permanent', 'T-03: Tissue System', 'T-04: Vascular', 'T-05: Internal Structure'],
      'Ch9: Physiology': ['T-01: Mineral Absorption', 'T-02: Transpiration', 'T-03: Photosynthesis', 'T-04: Respiration'],
      'Ch10: Reproduction': ['T-01: Sexual', 'T-02: Asexual'],
      'Ch11: Biotechnology': ['T-01: Introduction', 'T-02: Tissue Culture', 'T-03: Genetic Engineering', 'T-04: Applications', 'T-05: Gene Cloning'],
      'Ch12: Environment': ['T-01: Adaptation', 'T-02: Conservation']
    }
  },
  'Biology 2nd': {
    id: 'bio2',
    name: 'Biology 2nd',
    chapters: {
      'Ch1: Diversity': ['T-01: Classification', 'T-02: Major Phyla', 'T-03: Chordata', 'T-04: Nomenclature'],
      'Ch2: Identity': ['T-01: Hydra Structure', 'T-02: Hydra Locomotion', 'T-03: Hydra Reproduction', 'T-04: Grasshopper Morphology', 'T-05: Digestive', 'T-06: Circulatory', 'T-07: Respiratory', 'T-08: Excretory', 'T-09: Sense Organs', 'T-10: Reproduction', 'T-11: Fish Identity', 'T-12: Fish Circulation', 'T-13: Fish Respiration', 'T-14: Fish Reproduction'],
      'Ch3: Digestion': ['T-01: Canal', 'T-02: Glands', 'T-03: Liver', 'T-04: Pancreas', 'T-05: Gastric', 'T-06: Process', 'T-07: Absorption', 'T-08: Nervous System', 'T-09: Characteristics', 'T-10: Obesity'],
      'Ch4: Blood': ['T-01: Blood', 'T-02: Corpuscles', 'T-03: Coagulation', 'T-04: Heart', 'T-05: Cardiac Cycle', 'T-06: Blood Pressure', 'T-07: Circulation', 'T-08: Diseases', 'T-09: Treatment'],
      'Ch5: Respiration': ['T-01: System', 'T-02: Physiology', 'T-03: Gas Transport', 'T-04: Problems'],
      'Ch6: Excretion': ['T-01: Kidney', 'T-02: Physiology', 'T-03: Failure'],
      'Ch7: Locomotion': ['T-01: Skeleton', 'T-02: Axial', 'T-03: Appendicular', 'T-04: Bone', 'T-05: Muscle', 'T-06: Injuries'],
      'Ch8: Coordination': ['T-01: Nervous System', 'T-02: Brain', 'T-03: Eye', 'T-04: Ear', 'T-05: Hormones'],
      'Ch9: Reproduction': ['T-01: System', 'T-02: Gametogenesis', 'T-03: Development', 'T-04: Family Planning'],
      'Ch10: Defense': ['T-01: 1st & 2nd Defense', 'T-02: 3rd Defense', 'T-03: Antibodies'],
      'Ch11: Genetics': ['T-01: Principles', 'T-02: Mendel\'s Laws', 'T-03: Sex-linked', 'T-04: Blood Groups', 'T-05: Evolution'],
      'Ch12: Behavior': ['T-01: Innate', 'T-02: Learned', 'T-03: Social']
    }
  }
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Novice', min: 0, max: 300, color: 'text-slate-500', emoji: '🌱' },
  { level: 2, name: 'Learner', min: 301, max: 800, color: 'text-blue-500', emoji: '📚' },
  { level: 3, name: 'Student', min: 801, max: 1500, color: 'text-teal-500', emoji: '✏️' },
  { level: 4, name: 'Scholar', min: 1501, max: 2500, color: 'text-indigo-500', emoji: '📖' },
  { level: 5, name: 'Expert', min: 2501, max: 4000, color: 'text-orange-500', emoji: '🎓' },
  { level: 6, name: 'Master', min: 4001, max: 6000, color: 'text-red-500', emoji: '👨‍🎓' },
  { level: 7, name: 'Virtuoso', min: 6001, max: 8500, color: 'text-purple-500', emoji: '🧠' },
  { level: 8, name: 'Prodigy', min: 8501, max: 11500, color: 'text-pink-500', emoji: '⭐' },
  { level: 9, name: 'Champion', min: 11501, max: 15000, color: 'text-yellow-600', emoji: '🏆' },
  { level: 10, name: 'Legend', min: 15001, max: 20000, color: 'text-cyan-500', emoji: '💎' },
  { level: 11, name: 'Grandmaster', min: 20001, max: 30000, color: 'text-yellow-400', emoji: '👑' },
  { level: 12, name: 'HSC Elite', min: 30001, max: 100000, color: 'text-amber-500', emoji: '🔥' }
];
