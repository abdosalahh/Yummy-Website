import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrl: './market.component.css'
})
export class MarketComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) { // Check if fragment is not null
        this.scrollToSection(fragment);
      }
    });
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
