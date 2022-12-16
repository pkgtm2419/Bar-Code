import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { ToasterService } from '../toster.service';
import * as XLSX from 'xlsx';
import * as QRCode from 'qrcode';
const vCardsJS = require('vcards-js');
const download = require('downloadjs');

@Component({
  selector: 'app-contact-master',
  templateUrl: './contact-master.component.html',
  styleUrls: ['./contact-master.component.css']
})
export class ContactMasterComponent implements OnInit {
  qrCodeSize: number = 350;
  stringData: any;
  qrData: any;
  listData: any;
  searchData: any;
  pageData = 1;
  limits = [{ key: '50', value: 50 }, { key: '100', value: 100 }, { key: '250', value: 250 }, { key: '500', value: 500 }];
  limit: any = 50;
  isExcelDownload: boolean = false;
  id: any;
  vCard: any = vCardsJS();
  qr: any;
  closeResult: any;
  excelFile: any;

  constructor( private common: AppService, private toster: ToasterService) {
    this.vCard.workAddress.label = 'Firmenanschrift';
    this.vCard.version = '3.0';
  }

  ngOnInit(): void {
    this.getDataList();
  }

  onFileSelect(target: any) {
    this.excelFile = [];
    var files = target.files;
    for (let i = 0; i < files.length; i++) {
      this.excelFile.push(files[i]);
    }
  }

  uploadResume(): void {
    let formData: FormData = new FormData();
    for (let i = 0; i < this.excelFile.length; i++) {
      formData.append('images', this.excelFile[i]);
    }
    this.common.uploadFiles(formData).subscribe((res: any) => {
      if(res.status) {
        this.ngOnInit();
        this.excelFile = [];
        this.toster.success(res.message, "Success");
      } else {
        this.toster.error(res.message, "Error");
      }
    }),
    (error: any) => {
      this.toster.error("Some technical error "+error, "Error");
    }
  }

  generateQr(data: any) {
    console.log(this.vCard);
    this.id = data.contact_id;
    this.vCard.cellPhone = data.phonenumber;
    this.vCard.firstName = data.firstname;
    this.vCard.lastName = data.lastname;
    this.vCard.workPhone = data.phonenumber;
    this.vCard.organization = data.companyname;
    this.vCard.title = data.jobprofile;
    this.vCard.url = data.website;
    this.vCard.workAddress.street = data.street;
    this.vCard.workAddress.city = data.city;
    this.vCard.workAddress.stateProvince = data.state;
    this.vCard.workAddress.postalCode = data.pincode;
    this.vCard.workAddress.countryRegion = data.country;
    this.vCard.workEmail = data.email;
    this.vCard.workFax = data.faxnumber;
    this.vCard.workPhone = data.contactnumber;
    QRCode.toCanvas(
      document.getElementById('qrCanvas'),
      this.vCard.getFormattedString(),
      function (error: any) {
        if (error) console.error(error);
      }
    );
  }

  downloadQRCode(type: any) {
    if (!this.vCard) {
      return;
    }
    var fileName = `${this.vCard.firstName} ${this.vCard.lastName}`;
    if (type === 'SVG') {
      QRCode.toString(this.vCard.getFormattedString(), { type: 'svg' }, (error: any, string: any) => {
        if (error) {
          console.error(error);
          return;
        }
        download(string, `${fileName}.svg`, 'image/svg+xm');
      });
    } else if (type === 'PNG') {
      QRCode.toDataURL(this.vCard.getFormattedString(), (error: any, string: any) => {
        if (error) {
          console.error(error);
          return;
        }
        download(string, `${fileName}.png`, 'image/png');
      });
    } else if (type === 'vcf') {
      download(this.vCard.getFormattedString(), 'vcard.vcf', 'text/vcard');
    }
  }

  newContact(): void {
    this.vCard = vCardsJS();
    this.vCard.workAddress.label = 'Firmenanschrift';
    this.vCard.version = '3.0';
    console.log(this.vCard);
  }

  createQRCode() {
    console.log(this.vCard);
    var contData: any = {
      phonenumber :  (this.vCard.cellPhone) ? this.vCard.cellPhone : '',
      firstname :  (this.vCard.firstName) ? this.vCard.firstName : '',
      lastname :  (this.vCard.lastName) ? this.vCard.lastName : '',
      companyname :  (this.vCard.organization) ? this.vCard.organization : '',
      jobprofile :  (this.vCard.title) ? this.vCard.title : '',
      street: (this.vCard.workAddress.street) ? this.vCard.workAddress.street : '',
      city: (this.vCard.workAddress.city) ? this.vCard.workAddress.city : '',
      state: (this.vCard.workAddress.stateProvince) ? this.vCard.workAddress.stateProvince : '',
      country: (this.vCard.workAddress.countryRegion) ? this.vCard.workAddress.countryRegion : '',
      pincode: (this.vCard.workAddress.postalCode) ? this.vCard.workAddress.postalCode : '',
      website: (this.vCard.url) ? this.vCard.url : '',
      email :  (this.vCard.workEmail) ? this.vCard.workEmail : '',
      faxnumber :  (this.vCard.workFax) ? this.vCard.workFax : '',
      contactnumber :  (this.vCard.workPhone) ? this.vCard.workPhone : ''
    }
    let keys = Object.keys(contData);
    let match: any = {};
    keys.forEach((item: any) => {
      if(contData[item]) {
        match[item] = contData[item];
      }
    });
     this.common.createContact(contData).subscribe((res: any) => {
      if(res.status) {
        this.ngOnInit();
        this.toster.success(res.message, "Success");
      } else {
        this.toster.error(res.message, "Error");
      }
    }),
    (error: any) => {
      this.toster.error(`Technical issue ${error}`, "Error");
    };
  }

  getDataList(): void {
    this.common.getContactList().subscribe((res: any) => {
      if(res.status) {
        this.listData = res.data;
        this.isExcelDownload = true;
        this.limits = [{ key: 'ALL', value: this.listData.length }];
        this.toster.success(res.message, "Success");
      } else {
        this.toster.error(res.message, "Error");
      }
    }),
    (error: any) => {
      this.toster.error(`Technical issue ${error}`, "Error");
    };
  }

  qrSize(data: any) {
    this.qrCodeSize = data.value;
  }

  refresh(): void {
    this.ngOnInit();
  }

  dataLimit(): void{
    this.limit = ( document.getElementById('limit') as HTMLInputElement).value;
  }

  download(): void {
    let wb = XLSX.utils.table_to_book(document.getElementById('export'), { display: false, raw: true });
    XLSX.writeFile(wb, "customerReport.xlsx");
  }

}