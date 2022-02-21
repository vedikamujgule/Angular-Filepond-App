/**
 * Created by shubham on 8/5/18.
 */

import { Component,EventEmitter,ViewChild,ElementRef, Input, HostListener } from '@angular/core';
import { APPCONFIG } from '../config';
import {Router, ActivatedRoute, Params, NavigationStart} from '@angular/router';
import { AuthService } from "angularx-social-login";
import { TooltipModule } from 'ng2-tooltip-directive';
import { MdDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../shared/services/http.service';
import { SessionHandler } from '../shared/services/session-handler.service';
import { dialogComponent } from '../dialog/dialog.component';
import { FileUploader,FileLikeObject} from 'ng2-file-upload';
import { Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { DomSanitizer } from '@angular/platform-browser';
import 'jquery';
import 'bootstrap';
import "lightGallery";
import "lg-zoom";

declare var $ :any;
// const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';
const AppURL = APPCONFIG.appUrl+'/documents/upload'
const headers1 = [{'name':'Content-Type','value': 'multipart/form-data','Cache-Control':'no-cache' ,'Pragma':'no-cache'}];

function readBase64(file): Promise<any> {
  var reader  = new FileReader();
  var future = new Promise((resolve, reject) => {
    reader.addEventListener("load", function () {
      resolve(reader.result);
    }, false);

    reader.addEventListener("error", function (event) {
      reject(event);
    }, false);

    reader.readAsDataURL(file);
  });
  return future;
}
@Component({
    selector: 'documentsComponent',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss','../custom_style.scss'],
    providers: [HttpService, SessionHandler, HttpClient]

})
export class DocumentsComponent {

  public selectedFiles;

    
    
     modelObject: any=
      {
      userId : undefined,
      userName : undefined,
      consumerId : undefined,
      applianceId : undefined,
      system : undefined,
      country : undefined,
      region : undefined,
      documentSource : undefined,
      attachmentType : undefined,
      transactionId : undefined,
      documentName:undefined,
      urlMediaLink:undefined,
      documentSize:undefined,
      documentSizeUnit:undefined,
      documentUploadDate:undefined,
      parameterId:undefined,
      language : undefined
      };

     model: any[] =[
      {
      userId : undefined,
      userName : undefined,
      consumerId : undefined,
      applianceId : undefined,
      system : undefined,
      country : undefined,
      region : undefined,
      documentSource : undefined,
      attachmentType : undefined,
      transactionId : undefined,
      documentName:undefined,
      urlMediaLink:undefined,
      documentSize:undefined,
      documentSizeUnit:undefined,
      documentUploadDate:undefined,
      parameterId:undefined,
      language : undefined
      }];

      dialogRef;
      isExecuted:boolean;
      directories:any = [];
      uiItems:any= [];
      viewerFiles:any = ['pdf','docx'];
      paramsString:String="";
      data:any;
      nextFolderInFolderSequence:string;
      params:any =
       {
      userId : undefined,
      userName : undefined,
      consumerId : undefined,
      applianceId : undefined,
      system : undefined,
      country : undefined,
      region : undefined,
      documentSource : undefined,
      attachmentType : undefined,
      transactionId : undefined,
      language : undefined
    };
    newDirectories:any = [];
    pathStack = [];
    BASE_PATH: string;
    role:boolean;
    CURR_PATH: string;
    browserRefresh:boolean;
    showLoader:boolean = false;
    showModalLoader:boolean = false;
    uploadedFileNames:string;
    filesMap:any={};
    msg : string;
    encrptParam:string;
    isTemplate:boolean = false;
    isShared:boolean = false;
    rowToDel:string=null;
    showError:boolean=false;
    searchEve: boolean = true;
    fetchLimit = 20;
    fetchOffset = 0;
    safeURLMap = new Map([]);
    scrollingProcess= false;
    public uploader:FileUploader = new FileUploader({url: AppURL,autoUpload:false,queueLimit:6,removeAfterUpload:true,method:"POST",headers:headers1});
    public hasBaseDropZoneOver:boolean = false;
    public hasAnotherDropZoneOver:boolean = false;
    public view = 'list'
    @ViewChild('fileInput')
    fileInputVariable: ElementRef;
    @ViewChild('closebutton') closebutton;
    @Input() flag:boolean;

    onFileChange(event) {
      
      this.msg = "";
      let reader = new FileReader();
      if (event.target.files && event.target.files.length > 0) {
          this.selectedFiles = event.target.files[0];
          reader.readAsDataURL(event.target.files[0])
          reader.onloadend = () => {
              var res = reader.result;
          };
      }
  }


  getToolTipContent(document){
    let content = '';
    if(document.isFile)
    {
      content += '<div class="sd-tooltip">'
      content += '<small> Filename : ' + document.name +'</small>';
      content += '<small>Upload Date: ' + document.uploadTime.substring(0, 10)+'</small>';
      content += '<small>Upload Time: ' + document.uploadTime.substring(10)+'</small>';
      content += '</div>'
      return content;
    }
    else{
    return content;
    }
  }
  getFormattedFileName(fileName, length){
    let fName = fileName.substring(0, fileName.indexOf('.'));
    let extension = fileName.substring(fileName.indexOf('.')+1);
    fName = fName.length > length ? fName.substring(0,length-4)+ '... ' : fName;
    return fName+'.'+extension;
  }

  activeMenu(value: string)
  { 
       this.view=value;
       if(this.view == 'file'){
          setTimeout(()=>{
            this.popupGlr();
           },1000)
 }
  }
  myOptions = {
    'autoPlacement':true,
    'show-delay': 1000,
    'hide-delay':0,
    'theme': 'light',
    'max-width' : 400,
    'content-type' : 'html',
    'shadow' : true
  }

  popupGlr(){
   
    $(document).ready(function() 
    {
    
      (<any>$('#lightgallery')).lightGallery({
        mode:'lg-slide',
        thumbnail:true,
        mousewheel:false,
        selector: '.gal-item',
        loadYoutubeThumbnail: true,
        youtubeThumbSize: 'default',
        loadVimeoThumbnail: true,
        vimeoThumbSize: 'thumbnail_medium',
        share: false,
        download:true,
        size:true,
        zoom:true
      });
  
  }) 
  }



  
  fetchExtension(item:any)
  {
    if(item.isFile)
    {
      let extensionfile=item.name.split(".");
    return extensionfile[extensionfile.length-1].toUpperCase() 
    }
    else
    {
        return "abc";
    }
   
   }

  transform(url) {
    if(this.safeURLMap.has(url) && this.safeURLMap.get(url) != undefined){
      return this.safeURLMap.get(url);
    }
    var newURL = this.sanitizer.bypassSecurityTrustResourceUrl(url)
    this.safeURLMap.set(url,newURL);
    return newURL;
  }
  search(value: string)
     {
    
       this.router.navigate(['/app/search'], { queryParams: { searchParameter: value} });
     
      }

      @HostListener("window:scroll", [])
          onScroll(): void {
          if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight -100 && this.infinateScrollLoader && !this.scrollingProcess) {
            this.scrollingProcess = true;
            this.setDirectories(this.CURR_PATH);
          }
      }

  onSubmit(modelObject) 
  {
    let token = localStorage.getItem('userEmail');
        const httpOptions = {
          headers : new Headers({
                'Content-Type': 'application/json',
                'googleEmailId': token,
                'region' : 'EMEA',
                'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            }) };
      var data=JSON.parse(JSON.stringify(modelObject));
      this.httpService.postRequestWithHeader(data,"documentsServiceDocs/updateFileParameters",httpOptions).subscribe(
          res => {
           console.log(res);
           this.closebutton.nativeElement.click();
           this.setDirectories(this.CURR_PATH);
         
          },
          err => {
            console.log(err);
            this.closebutton.nativeElement.click();
          
          }
        )
  }





  public uploadfile() {
  
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.doc|\.docx|\.pdf)$/i;
    let that =this;
    
    if(allowedExtensions.exec(this.selectedFiles.name)){
    
      $("#closeModal").click();
      $("div").removeClass("modal-backdrop fade in");

      $('#myModal').modal('hide');
      this.showLoader = true;
    this.pushFileToStorage(this.selectedFiles, null).subscribe((event:any) => {
        if(event.status==409){
         
          this.dialogRef = that.dialog.open(dialogComponent);
          this.dialogRef.componentInstance.msg = "issue has occured while file uploading";
          this.dialogRef.afterClosed().subscribe(result => {
            $('#myModal').modal('hide');
              that.refreshDirectory()
              //that.setDirectories(that.CURR_PATH);
            });
        }
        else if(event instanceof HttpResponse) {
            console.log('File is completely uploaded!');
            this.showLoader = false;
               this.dialogRef = that.dialog.open(dialogComponent);
              that.dialogRef.componentInstance.msg = event.body;

              this.dialogRef.afterClosed().subscribe(result => {
                $('#myModal').modal('hide');
                that.setDirectories(that.CURR_PATH);
              });


              this.fileInputVariable.nativeElement.value = "";
              // this.dialogRef.close();
              // that.dialogRef.close();
              return;

        }

    
    
    });
  }else{
    this.showLoader = false;
    this.msg = "extension not allowed";
  }

 
    // this.clearAll();
}





pushFileToStorage(file: File, body){
 
  if(file.size>3145728){
    this.dialogRef = this.dialog.open(dialogComponent);
    this.dialogRef.componentInstance.msg = "File size should be less than 3MB!";
    this.dialogRef.afterClosed().subscribe(result => {
      //  $("#myModal").hide();

        this.setDirectories(this.CURR_PATH);
      });
      return;
  }
  else{
 this.showLoader = true;
  
      const formdata: FormData = new FormData();
      formdata.append('file', file,file.name);
      formdata.append('path', this.CURR_PATH);
      let token = this.httpService.id_token;
      const req = new HttpRequest('POST', APPCONFIG.appUrl+'/documentsServiceDocs/uploadTemplate', formdata, {
        headers:new HttpHeaders({'Access-Control-Allow-Origin':'*',
        'Cache-Control':'no-cache' ,'Pragma':'no-cache',
        'authtoken':token
      }),
          reportProgress: true,
          responseType: 'text'
      }
      
      );
      return this.httpClient.request(req);
    }
 
}

    public fileOverBase(e:any):void {
      this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e:any):void {
      this.hasAnotherDropZoneOver = e;
    }

    public onFileSelected(event: EventEmitter<File[]>) {
      console.log(event);
      const file: File = event[0];

  let that = this;
      readBase64(file)
        .then(function(data) {
        console.log(data);
        that.filesMap.data = data;
      })

    }
public uploadMyFiles(){

  var items = this.uploader.queue;
  var requestArr = [];
  for(var i in items){
    const file: File =items[i]["_file"];
    let obj:any = {};
    obj.name=file.name;
    obj.file = this.filesMap.data;
    requestArr.push(obj);
    // readBase64(file)
    //     .then(function(data) {
    //     console.log(data);
    //     obj.file = data;
    //     requestArr.push(obj);
    //   })



  }

  this.submitFiles(requestArr);

}

public submitFiles(filesArr){

  let token = localStorage.getItem('userEmail');
  let headers      = new Headers({
              'Access-Control-Allow-Origin':'*',
              'googleEmailId': token,
              'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            });
  let options       = { headers: headers };

  this.showLoader = true;
  
  this.httpService.postRequestWithHeader(filesArr,"/documents/upload",options).subscribe(
    res => {
     console.log(res);
      this.showLoader = false;
      // this.spinner.hide();
    },
    err => {
      this.httpService.onEnd();
      this.showLoader = false;
    }
  )
}





    constructor(private httpClient: HttpClient,private sessionHandler:SessionHandler,private router: Router,private sanitizer: DomSanitizer,  public httpService : HttpService, public dialog: MdDialog, private formBuilder: FormBuilder
      ,private activatedRoute: ActivatedRoute, private authService:AuthService) 
      {
        
        this.activatedRoute.queryParams.subscribe(curparams => {
            this.encrptParam = curparams['param'];
            if(this.encrptParam != undefined){
              localStorage.setItem('initParam',this.encrptParam);
            }
        });

    }


    ngOnInit() {
      let region = this.getParameterByName('region');
      let country = this.getParameterByName('country');
      let environment = this.getParameterByName('environment');
      let customer_id = this.getParameterByName('customer_id');
      let transaction_id = this.getParameterByName('transaction');
      let folder = this.getParameterByName('folder');
       
     
     

      if(region == null || region==''){
      
        region = 'EMEA';
      }
     

      this.BASE_PATH = "/root/" + region;///rrot/Emea
      this.CURR_PATH = this.BASE_PATH;


    if(country != null && country != ''){
        this.CURR_PATH = this.CURR_PATH  + "/" + country;
        this.pathStack.push(country);
    }

    if(environment != null && environment != ''){
      this.CURR_PATH = this.CURR_PATH  + "/documents/" + environment;
      this.pathStack.push('documents');
      this.pathStack.push(environment);
  }

  if(customer_id != null && customer_id != ''){
    this.CURR_PATH = this.CURR_PATH  + "/" + customer_id;
    this.pathStack.push(customer_id);
}


      if(transaction_id != null && transaction_id != ''){
        this.CURR_PATH = this.CURR_PATH  + "/" + transaction_id;
        this.pathStack.push(transaction_id);

        if(folder != null && folder != ''){
          this.CURR_PATH = this.CURR_PATH  + "/" + folder;
          this.pathStack.push(folder);
        }
      }      
      this.isExecuted = false;
      this.authService.authState.subscribe((user) => {
        if(user != null){
          if(!this.isExecuted){
            this.setDirectories(this.CURR_PATH);
            //this.check();
          }
          this.isExecuted = true;
        }
      });
    }

    onChange(event: any, input: any) {
     
      let files = [].slice.call(event.target.files);

      input.value = files.map(f => f.name).join(', ');
      this.uploadedFileNames = input.value;
      console.log('uploadedFileNames '+this.uploadedFileNames);
    }


    getParameterByName(name: any)
     { 
        let url = window.location.href;
        name = name.replace(/[[]]/g, "\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return results[2];
      }

 


      direct:any;



      edit(fileParameters)
      {           

                this.params=JSON.parse(fileParameters);
               
                  if(this.params!=null)
                    {
                     this.modelObject=this.params;
                    }
                       
      }



showUpload:boolean;
        public infinateScrollLoader = true;
        public offset = 1;
        public scrollable_value = 0;
        searchParameter:string='EMEA';
        defaultPageLimit:number=50;
        documentData:any=[];
        documentDataReplica = [];
        counterArray:any=[];


        

        check()
       {
        
        var self=this;
        $(window).on('scroll', function() {
        var winscroll = $(window).scrollTop();
        var docHeight = $(document).height()-150;
        var winHeight = $(window).height();
        self.scrollable_value = $(document).height();
        if ($(window).scrollTop() + $(window).height() > $(document).height() -20)
         {
             //this.showLoader = true;
            //alert("in check method");
            if ( self.documentDataReplica.length >= self.offset )  {
              this.showLoader = true;
               self.offset = self.offset + self.defaultPageLimit;
             
              let pageNo=self.documentDataReplica.length;
              self.setDirectories(self.CURR_PATH);
            } else {
              self.infinateScrollLoader = false;
            }

           
        }
        }
        );
        }
 

      setDirectories(path)
      {
        
        
        this.infinateScrollLoader = true;
               
        console.log("path"+path);
          
          let folder = this.CURR_PATH.substring(this.CURR_PATH.lastIndexOf("/")+1);
          if(folder =="templates"){
            this.isTemplate = true;
          }else{
            this.isTemplate = false;
          }
        
          if(folder.startsWith('994') && 'transactionId'==this.nextFolderInFolderSequence){
            this.isShared = true;
          }else{
            this.isShared = false;
          }
          this.showLoader = true;
        // this.spinner.show();
        let token = localStorage.getItem('userEmail');
        const httpOptions = {
          headers : new Headers({
                'Content-Type': 'application/json',
                'googleEmailId': token,
                'region' : 'EMEA',
                'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            }) };
        
            let url = `documentsServiceDocs/files/list?path=${path}&limit=${this.fetchLimit}&offset=${this.fetchOffset}`;
            if(this.encrptParam == undefined || this.encrptParam == '' && localStorage.getItem('initParam') != undefined){
                this.encrptParam = localStorage.getItem('initParam');
                localStorage.removeItem('initParam');
            }
            if (this.encrptParam) {
              url = `${url}&encryptedParam=${encodeURIComponent(this.encrptParam)}`;
            } else {
              url = `${url}&encryptedParam=`;
            }
            

            
        this.httpService.getRequestWithHeader(url,httpOptions).subscribe(
          res => {

            if(res['message'] == 'error_occured'){
              this.showLoader = false;
             this.httpService.onEnd();
             //this.router.navigateByUrl('/extra/login');

              return;
           }
          
          this.directories = res['data'];
          if (this.directories.length < this.fetchLimit) {
            this.infinateScrollLoader = false;
          } else {
            this.fetchOffset += this.fetchLimit;
            this.infinateScrollLoader = true;
          }
          this.scrollingProcess = false;
          this.nextFolderInFolderSequence = res['nextFolderInFolderSequence'];
        
          this.encrptParam="";
           path = res['path'];
           this.CURR_PATH=path;
          
           let folder = this.CURR_PATH.substring(this.CURR_PATH.lastIndexOf("/")+1);
       
          if(folder.startsWith('994')){
            this.isShared = true;
          }else{
            this.isShared = false;
          }
          if(path=='/root/EMEA')
          {
             this.showUpload=false;
          }
          else{this.showUpload=true;}
          var pa = path;
             
           pa =pa.substring("/root/EMEA/".length);
           var ar = pa.split("/");
           if(!(ar.length > 0 && ar[0]=="")){
            this.pathStack = ar;
           }
        
            for(let i=0;i<this.directories.length;i++)
            {
                      //  this.documentDataReplica.push(this.directories[i]);//added
                       this.params=JSON.parse(this.directories[i].fileParameters);
                       this.paramsString='';
                       
                      if(this.params!=null)
                    {
                     
                      this.model.push(this.params);
                     
                      for(const parameter in this.params)
                      { 
                       switch(parameter)
                        { 
                          case 'region':
                          case 'country': 
                          case 'system':
                          case 'consumerId': 
                          case 'transactionId':
                          case 'documentSource':
                          case 'userId': 
                          case 'userName': 
                          case 'attachmentType':
                          case 'applianceId': 
                          case 'language': 
                          this.paramsString =  this.paramsString +((this.params[parameter]!=null) ? parameter +" = "+this.params[parameter] :"") + " , ";    
                        } 
                         
                      }
                     this.directories[i].fileParameter=this.paramsString.substring(0,this.paramsString.length-2);
                     //this.directories.push(this.directories[i]);
                    }
                       
                    if(this.directories[i].isFile)
                    {
                    var val = this.directories[i]['fullPath'];
                    var documentExtension = this.directories[i]['name'].substring(this.directories[i]['name'].lastIndexOf('.')+1);
                    
                    //this.directories[i]['fullPath']+="&response-content-disposition=attachment;filename="+this.directories[i]['name'];
                    
                    //     if(val.includes('https://storage.cloud.google.com'))
              //     {
              //      this.directories[i]['fullPath']=val;
              //      }
              //     else
              //     { 
                   
              //  this.directories[i]['fullPath'] = val.substring(0, val.indexOf('?')+1) +'alt=media';
                     
              //      }
                    if(this.viewerFiles.includes(this.directories[i]['name'].substring(this.directories[i]['name'].lastIndexOf('.')+1)))
                    {
                
                     
                      this.directories[i]['fullPath'] = this.transform('https://drive.google.com/viewerng/viewer?embedded=true&toolbar=0&navpanes=0&scrollbar=0&url='+ encodeURIComponent(this.directories[i]['fullPath']));
                    
                    }
                  }
                  
                    this.documentDataReplica.push(this.directories[i]);
            }

    //for grid views
  
   
   //this.uiItems = this.directories;
   this.uiItems = this.documentDataReplica





    this.showLoader = false;
          },
          err => {
            this.httpService.onEnd();
            this.showLoader = false;
          }
        )
      }

      validateQueryParams(region, country, environment, customer_id){
        
        if(region == null){
         
          return false;
        }
        return true;
      }

      openFolderWithIndex(index){
        this.pathStack.length = index;
        this.openFolder(null,false);
      }

      openFolder(folderName, isPush){
        this.documentDataReplica=[];
        this.fetchOffset=0;
      
        if(isPush)
          this.pathStack.push(folderName);

        let newPath = this.BASE_PATH;
        for(let path of this.pathStack){
          newPath = newPath + "/" +path;
        }
        this.CURR_PATH = newPath;
        this.setDirectories(this.CURR_PATH);
      }

      moveBack(){
        this.pathStack.splice((this.pathStack.length -1), 1);
        let len = this.pathStack.length
        this.openFolder("", false);
      }

      refreshDirectory(){
        this.fetchOffset = 0;
        this.documentDataReplica=[];
        this.setDirectories(this.CURR_PATH);
      }

      sanitize(url){
        return this.sanitizer.bypassSecurityTrustUrl(url);
      }



      templateId:any;
      dataArray:any=[];
      documentId:any;
      parameterId:any;
      urlMediaLink:string;
      public rowToDelete(blobName,templateId){
  
        this.rowToDel = blobName;
        this.templateId=templateId;
        this.dataArray[0]=this.rowToDel;
        this.dataArray[1]=this.templateId;
      }



      
     
      deleteFile(){
        
        if(this.rowToDel == null){
          return;}
          this.showLoader = true;
        let body:any={data:this.dataArray};
        let token = localStorage.getItem('userEmail');
        const httpOptions = {
          headers : new Headers({
                'Content-Type': 'application/json',
                'googleEmailId': token,
                'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            }) };
        this.httpService.postRequestWithHeader(body,"documentsServiceDocs/deleteTemplate",httpOptions).subscribe(
          res => {
            this.rowToDel = null;

            var jsonResponse = JSON.parse(res['_body']);
            if(!jsonResponse){


              this.showLoader = false;
              this.httpService.onEnd();
              this.dialogRef = this.dialog.open(dialogComponent);
            this.dialogRef.componentInstance.msg = "Error...!!! Try again";
            this.dialogRef.afterClosed().subscribe(result => {
              //  $("#myModal").hide();

                this.setDirectories(this.CURR_PATH);
              });

             return;

              };
                       this.showLoader = false;

                       this.dialogRef = this.dialog.open(dialogComponent);
                       this.dialogRef.componentInstance.msg = "File Deleted Successfully";

                       this.dialogRef.afterClosed().subscribe(result => {
                       this.refreshDirectory();
                       });

                

            // this.spinner.hide();
          },
          err => {
            this.httpService.onEnd();
            this.showLoader = false;
            this.rowToDel = null;

          }
        )

      }






      public rowToDeletee(fileParameters:any){
        var data=JSON.parse(fileParameters);
        this.rowToDel = data.documentName;
        this.parameterId=data.parameterId;
        this.documentId=data.documentId;
        this.urlMediaLink=data.urlMediaLink;
        
        this.dataArray[0]=this.rowToDel;
        this.dataArray[1]=this.parameterId;
        this.dataArray[2]=this.documentId;
        this.dataArray[3]=this.urlMediaLink;
    
      }



      
     
      deleteFilee(){
      
        if(this.rowToDel == null){
          return;}
          this.showLoader = true;
         let body:any={data:this.dataArray};
        let token = localStorage.getItem('userEmail');
        const httpOptions = {
          headers : new Headers({
                'Content-Type': 'application/json',
                'googleEmailId': token,
                'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            }) };
        this.httpService.postRequestWithHeader(body,"documentsServiceDocs/deleteFile",httpOptions).subscribe(
          res => {
            this.rowToDel = null;

            var jsonResponse = JSON.parse(res['_body']);
            if(!jsonResponse){


              this.showLoader = true;

              this.httpService.onEnd();

          
            this.dialogRef = this.dialog.open(dialogComponent);
            this.dialogRef.componentInstance.msg = "Error...!!! Try again";
            this.dialogRef.afterClosed().subscribe(result => {
              //  $("#myModal").hide();
            
                this.setDirectories(this.CURR_PATH);
              });

             return;

              };
                      
                       this.dialogRef = this.dialog.open(dialogComponent);
                       this.dialogRef.componentInstance.msg = "File Deleted Successfully";
                       this.dialogRef.afterClosed().subscribe(result => {
                       this.refreshDirectory();
                       });

          

            // this.spinner.hide();
          },
          err => {
            this.httpService.onEnd();
            this.showLoader = false;
            this.rowToDel = null;

          }
        )

      }




      downloadFile(url)
      {
        if(url.changingThisBreaksApplicationSecurity != undefined && url.changingThisBreaksApplicationSecurity != ''){
          url = url.changingThisBreaksApplicationSecurity;
        }
        window.open(url, '_blank');
        
      }


      viewFileByFileNamee(fileName,url)
      {
       
       this.showLoader = true;
        let  headers = new Headers({'Access-Control-Allow-Origin':'*','Cache-Control':'no-cache' ,'Pragma':'no-cache'});
        headers.append("Content-Type","application/pdf");

        const httpOptions = {
          observe: 'response',
          headers : headers,
          responseType  : ResponseContentType.Blob as ResponseContentType.Json
        };
        var extension = fileName.substr(fileName.lastIndexOf('.') + 1);
        
        this.httpService.getRequestWithHeader("download/file/viewPdf?path="+url+"&extension="+ extension, httpOptions).subscribe(
          res => {
            var buffer = res;
           
           
            if(extension==undefined || extension==null) {
                this.showLoader = false;
                console.log('No extension');
            }
            var blob ;
            if (extension.toUpperCase() === 'PDF') {
              blob = new Blob([buffer], {
                type: 'application/pdf'
            });
            }else if (extension.toUpperCase() === 'JPG' || extension.toUpperCase() === 'JPEG' || extension.toUpperCase() === 'PNG')
             { 
              blob = new Blob([buffer], {
                type: 'image/png'
            });
            }else if (extension.toUpperCase() === 'DOC') {
              blob = new Blob([buffer], {
                type: 'zip'
            });
            }else if(extension.toUpperCase() === 'DOCX'){
              blob = new Blob([buffer],{
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              });
            }
            
          
            var objectURL = URL.createObjectURL(blob);
            var embed = document.getElementById("embedPDF");
            objectURL = objectURL+'#toolbar=0';
            embed.setAttribute('src',objectURL);
            $("#pdfTitle").html(fileName);
            $("#viewFileModal").modal('show');
            //(<HTMLIFrameElement>document.getElementById('embedPDF')).contentDocument.location.reload(true);
         (<HTMLIFrameElement> document.getElementById('embedPDF')).src =  (<HTMLIFrameElement> document.getElementById('embedPDF')).src;
            this.showLoader = false;
          },
          error => {
            this.showLoader = false;
            alert("error");
          }
        )
      }

    

      resendEmailVerify() {
          if(confirm("Are you sure to send the email!")) {
        	   this.reSendEmail();
          }
      }

      reSendEmail(){
        this.showLoader = true;
        let token = localStorage.getItem('userEmail');
        const httpOptions = {
          headers : new Headers({
                'googleEmailId': token,
                'region' : 'EMEA',
                'Cache-Control':'no-cache' ,'Pragma':'no-cache'
            }),
            responseType  : ResponseContentType.Blob as ResponseContentType.Text
           };
        this.httpService.getRequestWithHeader("/documentsServiceDocs/resend?path="+ this.CURR_PATH, httpOptions).subscribe(
          res => {
            this.dialogRef = this.dialog.open(dialogComponent);
            this.dialogRef.componentInstance.msg = "Email sent successfully";
            this.showLoader = false;
          },
          err => {
            this.dialogRef = this.dialog.open(dialogComponent);
            this.dialogRef.componentInstance.msg = "Some error occured";
            this.showLoader = false;
          }
        )
      }


}

