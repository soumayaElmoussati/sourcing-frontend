import {Component, inject} from '@angular/core';
import {DrawerModule} from "primeng/drawer";
import {LayoutService} from "@/layout/service/layout.service";
import {DatePickerModule} from "primeng/datepicker";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-profile-menu',
    imports: [DrawerModule, DatePickerModule, FormsModule, CommonModule],
    standalone: true,
    template:``
})
export class AppProfileMenu {
    layoutService = inject(LayoutService);

    get rightMenuVisible() {
        return this.layoutService.layoutState().rightMenuActive;
    }

    set rightMenuVisible(val: boolean) {
        this.layoutService.layoutState.update((prev) => ({...prev, rightMenuActive: val}))
    }

    date = new Date();

}
