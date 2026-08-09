import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  heroArchiveBox,
  heroArrowLeft,
  heroArrowRightOnRectangle,
  heroBellAlert,
  heroBuildingOffice,
  heroCalendarDays,
  heroChartBar,
  heroCheckBadge,
  heroCheckCircle,
  heroClipboardDocumentList,
  heroClock,
  heroExclamationTriangle,
  heroInbox,
  heroMagnifyingGlass,
  heroMegaphone,
  heroPaperAirplane,
  heroPencilSquare,
  heroPlus,
  heroTrash,
  heroUserCircle,
  heroXCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIcons({
      heroArchiveBox,
      heroArrowLeft,
      heroArrowRightOnRectangle,
      heroBellAlert,
      heroBuildingOffice,
      heroCalendarDays,
      heroChartBar,
      heroCheckBadge,
      heroCheckCircle,
      heroClipboardDocumentList,
      heroClock,
      heroExclamationTriangle,
      heroInbox,
      heroMagnifyingGlass,
      heroMegaphone,
      heroPaperAirplane,
      heroPencilSquare,
      heroPlus,
      heroTrash,
      heroUserCircle,
      heroXCircle,
      heroXMark,
    }),
  ]
};
