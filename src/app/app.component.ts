import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'AICHA SHOP';
  showClientLayout = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Écouter les changements de route pour déterminer quel layout afficher
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Ne pas afficher le layout client pour admin, seller et auth
      this.showClientLayout = !url.startsWith('/admin') &&
                              !url.startsWith('/seller') &&
                              !url.startsWith('/auth');
    });

    // Vérifier l'URL initiale
    const currentUrl = this.router.url;
    this.showClientLayout = !currentUrl.startsWith('/admin') &&
                            !currentUrl.startsWith('/seller') &&
                            !currentUrl.startsWith('/auth');
  }
}
