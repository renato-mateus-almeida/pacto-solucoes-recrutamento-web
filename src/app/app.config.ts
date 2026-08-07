import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  heroBuildingOffice,
  heroUserCircle,
  heroArrowRightOnRectangle,
  heroArrowLeft,
  heroPencilSquare,
  heroMagnifyingGlass,
  heroChartBar,
  heroClipboardDocumentList,
  heroInbox,
  heroCalendarDays,
  heroCheckCircle,
  heroClock,
  heroXCircle,
  heroPlus,
  heroEye,
  heroChatBubbleLeft,
  heroCheckBadge,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { heroChevronRightSolid } from '@ng-icons/heroicons/solid';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIcons({
      heroBuildingOffice,
      heroUserCircle,
      heroArrowRightOnRectangle,
      heroArrowLeft,
      heroPencilSquare,
      heroMagnifyingGlass,
      heroChartBar,
      heroClipboardDocumentList,
      heroInbox,
      heroCalendarDays,
      heroCheckCircle,
      heroClock,
      heroXCircle,
      heroPlus,
      heroEye,
      heroChatBubbleLeft,
      heroCheckBadge,
      heroXMark,
      heroChevronRightSolid,
    }),
  ]
};
