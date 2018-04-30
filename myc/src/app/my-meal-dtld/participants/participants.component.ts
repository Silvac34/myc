import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {
  @Input() meal: any;
  @Input() role: string;
  @Input() datasUser: any;
  now = new Date();

  constructor() { }

  ngOnInit() {
  }

}
