import CMS from "netlify-cms";

import { SlidesControl, SlidesPreview } from "./Slides";

CMS.registerWidget("slides", SlidesControl, SlidesPreview);
