import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { JobAnnouncementsService } from '@/pages/hr/jobannouncements/job-announcements.service';
// import { ProfileBesoinService } from '@/pages/hr/ficheprofilebesoin/profile-besoin.service';
@Component({
  selector: 'stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-12 md:col-span-4">
      <div class="card relative h-28 rounded-xl !p-4">
        <span class="text-sm font-medium leading-none">Total des annonces</span>
        <div class="flex justify-between">
          <div class="flex items-center">
            <div class="flex justify-center items-center h-8 w-20 rounded p-2 mr-4 text-black"
                 style="background-color: #fc6161; box-shadow: 0px 6px 20px rgba(252, 97, 97, 0.3)">
              <i class="pi pi-file"></i>
            </div>
            <div class="leading-loose text-3xl">{{ totalAnnonces }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-4">
      <div class="card relative h-28 rounded-xl !p-4">
        <span class="text-sm font-medium leading-none">Profils Besoins</span>
        <div class="flex justify-between">
          <div class="flex items-center">
            <div class="flex justify-center items-center h-8 w-20 rounded p-2 mr-4 text-black"
                 style="background-color: #0bd18a; box-shadow: 0px 6px 20px rgba(11, 209, 138, 0.3)">
              <i class="pi pi-users"></i>
            </div>
            <div class="leading-loose text-3xl">{{ totalProfils }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'col-span-12 grid grid-cols-12 gap-4'
  }
})
export class StatsWidget implements OnInit {
  totalAnnonces: number = 0;
  totalProfils: number = 0;

  constructor(
    // private jobService: JobAnnouncementsService,
    // private profilService: ProfileBesoinService
  ) {}

  async ngOnInit() {
    // await this.jobService.ensureInitialized();
    // await this.profilService.ensureInitialized();

    // const annonces = await this.jobService.getAll();
    // const profils = await this.profilService.getProfiles();

    // this.totalAnnonces = annonces.length;
    // this.totalProfils = profils.length;
  }
}
