import CMS from "netlify-cms";

import { SlidesControl, SlidesPreview } from "./Slides/Slides";

CMS.registerWidget("slides", SlidesControl, SlidesPreview);
