import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isFilterDropdownOpen: boolean = false;
  
  selectedFilter: string = 'Recipe name'; // Default filter

  toggleFilterDropdown() {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.isFilterDropdownOpen = false; // Close the dropdown after selecting a filter
  }
}
