ALTER TABLE IF EXISTS link
ALTER COLUMN description TYPE TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_summary TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_context VARCHAR(255);

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_role VARCHAR(255);

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_goal TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_languages TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_technologies TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_takeaways TEXT;

UPDATE link
SET project_summary = description
WHERE project_summary IS NULL OR BTRIM(project_summary) = '';

UPDATE link
SET project_context = 'Academic project'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_context IS NULL OR BTRIM(project_context) = '');

UPDATE link
SET project_role = 'Co-author and developer'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_role IS NULL OR BTRIM(project_role) = '');

UPDATE link
SET project_summary = 'BlobbyKelp is a bachelor thesis prototype for organic data visualization that represents grouped data points on maps and 2D graphs using blobby shapes.' || CHR(10) || CHR(10) ||
                      'The project combines routing, hull generation, and spline-based smoothing to transform rigid geometric groupings into clearer and more expressive visual structures.'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_summary IS NULL OR BTRIM(project_summary) = '');

UPDATE link
SET description = 'This bachelor thesis explores how grouped data points can be visualized more organically while preserving readability and structural meaning.' || CHR(10) || CHR(10) ||
                  'The prototype, named BlobbyKelp, was built as a way to move beyond rigid geometric clusters and create a softer visual language for showing relationships between grouped data on maps and 2D graphs. It draws inspiration from GapMinder, Kelp Diagrams, BubbleSets, and KelpFusion, while focusing on a more continuous and organic result.' || CHR(10) || CHR(10) ||
                  'To get there, the project combines graph routing, local grouping, hull generation, and curve smoothing. Minimum spanning tree logic was used to connect related points efficiently, convex and non-convex hull techniques were used to shape the grouped regions, and spline-based smoothing helped turn sharp boundaries into blobby forms that feel more natural to read.' || CHR(10) || CHR(10) ||
                  'A big part of the work was about balancing visual clarity with technical control. The final prototype not only improved the look of the grouped structures, but also supported interactive exploration through animation and adjustable thresholds, making it easier to inspect how grouped data evolves and how different clustering choices affect the output.'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (description IS NULL OR BTRIM(description) = '');

UPDATE link
SET project_goal = 'Investigate how plain geometric data groupings can be transformed reliably, deterministically, and continuously into organic, blobby shapes for maps and 2D graph visualizations.'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_goal IS NULL OR BTRIM(project_goal) = '');

UPDATE link
SET project_languages = 'JavaScript'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_languages IS NULL OR BTRIM(project_languages) = '');

UPDATE link
SET project_technologies = 'SVG
Graph routing
Kruskal''s Algorithm
Graham Scan
Non-convex hull generation
Bowyer-Watson triangulation
B-splines
Bezier curves
Catmull-Rom splines
Animation controls
Distance-threshold interaction'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_technologies IS NULL OR BTRIM(project_technologies) = '');

UPDATE link
SET project_takeaways = 'Learned how computational geometry, routing, and spline-based smoothing can be combined to improve grouped data readability while creating a more organic and visually expressive rendering style.'
WHERE LOWER(project_name) LIKE '%bachelor%'
  AND (project_takeaways IS NULL OR BTRIM(project_takeaways) = '');

UPDATE link
SET project_context = 'Academic project'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_context IS NULL OR BTRIM(project_context) = '');

UPDATE link
SET project_role = 'Co-developer and researcher'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_role IS NULL OR BTRIM(project_role) = '');

UPDATE link
SET project_summary = 'GRIP-TK is a master thesis toolkit for authoring and evaluating XR interaction techniques through a node-graph based workflow.' || CHR(10) || CHR(10) ||
                      'It was designed to reduce repeated experiment setup work by connecting interaction logic, runtime behavior, logging, and evaluation flow in one system.'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_summary IS NULL OR BTRIM(project_summary) = '');

UPDATE link
SET description = 'This master thesis presents GRIP-TK, a node-graph toolkit for immersive authoring and evaluation of XR interaction techniques. The main idea was to support the repeated setup work that often appears across XR experiments, where developers need to rebuild similar interaction structures, logging systems, and evaluation pipelines from study to study.' || CHR(10) || CHR(10) ||
                  'The toolkit was implemented as a framework for composing interaction techniques together with experiment logic, visualization flow, and data collection support. It was not only meant to help create techniques more systematically, but also to make them easier to inspect, extend, and connect to concrete evaluation designs.' || CHR(10) || CHR(10) ||
                  'To demonstrate that workflow, the thesis walks through how interaction techniques can be constructed inside the system and later extended, including a parallax-mitigated node variant. GRIP-TK was then used in a controlled Fitts'' Law study with five XR interaction techniques, showing that the toolkit could support both the runtime side of the experiment and the broader analysis pipeline needed to reach empirical conclusions.' || CHR(10) || CHR(10) ||
                  'A central outcome of the work is that the toolkit supports more than authoring alone. It helps connect technique construction, experiment execution, logging, and evaluation into a single workflow, while also leaving room for future usability and productivity evaluation of the toolkit itself.'
WHERE LOWER(project_name) LIKE '%master%'
  AND (description IS NULL OR BTRIM(description) = '');

UPDATE link
SET project_goal = 'Support the full XR experiment workflow by providing a node-graph toolkit for constructing interaction techniques, connecting them to experiment runtime logic, and linking them to logging and evaluation pipelines.'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_goal IS NULL OR BTRIM(project_goal) = '');

UPDATE link
SET project_languages = 'C#'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_languages IS NULL OR BTRIM(project_languages) = '');

UPDATE link
SET project_technologies = 'Unity
Meta XR SDK
Node-graph architecture
XR interaction techniques
Experiment runtime logic
Logging infrastructure
Visualization flow
Fitts'' Law evaluation
Qualitative analysis
Extensibility design'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_technologies IS NULL OR BTRIM(project_technologies) = '');

UPDATE link
SET project_takeaways = 'Toolkit architecture for reusable XR experiments
Interaction technique definition through modular node structures
Experiment-to-analysis workflow integration
Extensibility thinking across node, structure, and environment levels'
WHERE LOWER(project_name) LIKE '%master%'
  AND (project_takeaways IS NULL OR BTRIM(project_takeaways) = '');
