%% ============================================================
%%   Database name:  MEDEX                                     
%%   DBMS name:      Sybase SQL Anywhere 5.5                   
%%   Created on:     8/1/2003  9:14 AM                         
%% ============================================================

%% ============================================================
%%   Table: CREMATION                                          
%% ============================================================
create table CREMATION
(
    CASE_NO                 char(13)              not null,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    LAST_NAME               varchar(20)                   ,
    FIRST_NAME              varchar(20)                   ,
    MIDDLE                  varchar(15)                   ,
    INDIGENT                char(1)                       ,
    FUNERAL_HOME            varchar(50)                   ,
    APPROVED_BY             varchar(40)                   ,
    APPROVED_DATE           date                          ,
    FEE                     numeric(8,2)                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: EMPLOYEE                                           
%% ============================================================
create table EMPLOYEE
(
    EMPLOYEE_ID             char(10)              not null,
    LAST_NAME               varchar(20)                   ,
    FIRST_NAME              varchar(20)                   ,
    MIDDLE                  varchar(15)                   ,
    EMPL_GROUP              varchar(15)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (EMPLOYEE_ID)
);

%% ============================================================
%%   Table: NOTIFICATION                                       
%% ============================================================
create table NOTIFICATION
(
    AGENCY_TYPE             varchar(18)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (AGENCY_TYPE)
);

%% ============================================================
%%   Table: TRANSPORTATION                                     
%% ============================================================
create table TRANSPORTATION
(
    AGENCY                  varchar(45)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (AGENCY)
);

%% ============================================================
%%   Table: RACE                                               
%% ============================================================
create table RACE
(
    RACE                    varchar(10)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (RACE)
);

%% ============================================================
%%   Table: AGENCY                                             
%% ============================================================
create table AGENCY
(
    AGENCY                  varchar(45)           not null,
    AGENCY_TYPE             varchar(15)                   ,
    AGENCY_CONTACT          varchar(40)                   ,
    AREACODE                char(3)                       ,
    PHONE                   char(8)                       ,
    STREET_NO               numeric                       ,
    STREET_DIR              char(2)                       ,
    STREET_NAME             char(20)                      ,
    STREET_TYPE             char(4)                       ,
    SUITE_NO                char(5)                       ,
    CITY                    varchar(20)                   ,
    STATE                   char(2)                       ,
    ZIPCODE                 char(5)                       ,
    ZIPCODE_EXT             char(4)                       ,
    LOCATION_FAXAREACODE    char(3)                       ,
    LOCATION_FAX            char(8)                       ,
    BILLTO_STREET_NO        numeric                       ,
    BILLTO_STREET_DIR       char(2)                       ,
    BILLTO_STREET_NAME      char(20)                      ,
    BILLTO_STREET_TYPE      char(4)                       ,
    BILLTO_SUITE_NO         char(5)                       ,
    BILLTO_CITY             varchar(20)                   ,
    BILLTO_STATE            char(2)                       ,
    BILLTO_ZIPCODE          char(5)                       ,
    BILLTO_ZIPCODE_EXT      char(4)                       ,
    BILLTO_AREACODE         char(3)                       ,
    BILLTO_PHONE            char(8)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (AGENCY)
);

%% ============================================================
%%   Table: CASE_TYPE                                          
%% ============================================================
create table CASE_TYPE
(
    CASE_TYPE               char(3)               not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_TYPE)
);

%% ============================================================
%%   Table: EST_AGE                                            
%% ============================================================
create table EST_AGE
(
    ESTIMATED_AGE           varchar(15)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (ESTIMATED_AGE)
);

%% ============================================================
%%   Table: CITY                                               
%% ============================================================
create table CITY
(
    CITY                    varchar(20)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CITY)
);

%% ============================================================
%%   Table: STATE                                              
%% ============================================================
create table STATE
(
    STATE                   char(2)               not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (STATE)
);

%% ============================================================
%%   Table: PLACE                                              
%% ============================================================
create table PLACE
(
    PLACE_TYPE              varchar(12)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (PLACE_TYPE)
);

%% ============================================================
%%   Table: DEATH_LOCATION                                     
%% ============================================================
create table DEATH_LOCATION
(
    DEATH_LOCATION          varchar(12)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (DEATH_LOCATION)
);

%% ============================================================
%%   Table: COUNTY                                             
%% ============================================================
create table COUNTY
(
    COUNTY                  varchar(15)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (COUNTY)
);

%% ============================================================
%%   Table: IDENTIFIED_BY                                      
%% ============================================================
create table IDENTIFIED_BY
(
    IDENTIFIED_BY           varchar(20)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (IDENTIFIED_BY)
);

%% ============================================================
%%   Table: SPECIALTY                                          
%% ============================================================
create table SPECIALTY
(
    SPECIALTY               varchar(28)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (SPECIALTY)
);

%% ============================================================
%%   Table: NOK                                                
%% ============================================================
create table NOK
(
    NOK_RELATIONSHIP        varchar(40)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (NOK_RELATIONSHIP)
);

%% ============================================================
%%   Table: PHOTO_TYPE                                         
%% ============================================================
create table PHOTO_TYPE
(
    PHOTO_TYPE              varchar(15)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (PHOTO_TYPE)
);

%% ============================================================
%%   Table: SPECIMEN                                           
%% ============================================================
create table SPECIMEN
(
    SPECIMEN                varchar(30)           not null,
    SELECTION               char(1)                       ,
    SP_TEST                 char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (SPECIMEN)
);

%% ============================================================
%%   Table: TEST                                               
%% ============================================================
create table TEST
(
    TEST                    varchar(15)           not null,
    SP_TEST                 char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (TEST)
);

%% ============================================================
%%   Table: DRUG                                               
%% ============================================================
create table DRUG
(
    DRUG_CLASS              varchar(30)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (DRUG_CLASS)
);

%% ============================================================
%%   Table: RESULT                                             
%% ============================================================
create table RESULT
(
    RESULT                  varchar(33)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (RESULT)
);

%% ============================================================
%%   Table: UNIT                                               
%% ============================================================
create table UNIT
(
    UNIT                    varchar(8)            not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (UNIT)
);

%% ============================================================
%%   Table: TESTPROC                                           
%% ============================================================
create table TESTPROC
(
    TESTPROC                varchar(18)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (TESTPROC)
);

%% ============================================================
%%   Table: EMPL_GROUP                                         
%% ============================================================
create table EMPL_GROUP
(
    EMPL_GROUP              varchar(15)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (EMPL_GROUP)
);

%% ============================================================
%%   Table: INDIGENT                                           
%% ============================================================
create table INDIGENT
(
    CASE_NO                 char(12)              not null,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    ME_CASE                 char(1)                       ,
    ME_CASE_NO              char(12)                      ,
    NOTIFIED_BY             varchar(18)                   ,
    NOTIFIER                varchar(40)                   ,
    NOTIFIER_AREACODE       char(3)                       ,
    NOTIFIER_PHONE          char(8)                       ,
    LAST_NAME               varchar(20)                   ,
    FIRST_NAME              varchar(20)                   ,
    MIDDLE                  varchar(15)                   ,
    BIRTH_DATE              date                          ,
    AGE_YEAR                integer                       ,
    AGE_MONTH               integer                       ,
    AGE_DAY                 integer                       ,
    ESTIMATED_AGE           varchar(15)                   ,
    RACE                    varchar(10)                   ,
    SEX                     char(1)                       ,
    SOCIAL_SECURITY         char(11)                      ,
    OTHER_ID                varchar(20)                   ,
    STREET_NO               numeric                       ,
    STREET_DIR              char(2)                       ,
    STREET_NAME             char(20)                      ,
    STREET_TYPE             char(4)                       ,
    SUITE_NO                char(5)                       ,
    CITY                    varchar(20)                   ,
    STATE                   char(2)                       ,
    ZIPCODE                 char(5)                       ,
    DEATH_DATE              date                          ,
    DEATH_TIME              time                          ,
    DIAGNOSIS               varchar(40)                   ,
    DEATH_LOCATION          varchar(12)                   ,
    DEATH_CITY              varchar(20)                   ,
    PHYSICIAN               varchar(40)                   ,
    PHYSICIAN_AREACODE      char(3)                       ,
    PHYSICIAN_PHONE         char(8)                       ,
    NOK_NAME                varchar(40)                   ,
    NOK_RELATIONSHIP        varchar(40)                   ,
    NOK_STREET_NO           numeric                       ,
    NOK_STREET_DIR          char(2)                       ,
    NOK_STREET_NAME         char(20)                      ,
    NOK_STREET_TYPE         char(4)                       ,
    NOK_SUITE_NO            char(5)                       ,
    NOK_CITY                varchar(20)                   ,
    NOK_COUNTY              varchar(15)                   ,
    NOK_STATE               char(2)                       ,
    NOK_AREACODE            char(3)                       ,
    NOK_PHONE               char(8)                       ,
    NOK_AREACODE2           char(3)                       ,
    NOK_PHONE2              char(8)                       ,
    DISPOSITION             varchar(10)                   ,
    IND_STATUS              varchar(15)                   ,
    FUNDING1                varchar(8)                    ,
    AMOUNT1                 numeric(8,2)                  ,
    FUNDING2                varchar(8)                    ,
    AMOUNT2                 numeric(8,2)                  ,
    FUNDING3                varchar(8)                    ,
    AMOUNT3                 numeric(8,2)                  ,
    RELEASED_TO             varchar(50)                   ,
    DIRECT_VOUCHER          char(10)                      ,
    BUDGET_NO               char(18)                      ,
    NOTE                    long varchar                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: SYSTEM_TABLE                                       
%% ============================================================
create table SYSTEM_TABLE
(
    BME_SEQ                 numeric                       ,
    NME_SEQ                 numeric                       ,
    TOX_SEQ                 numeric                       ,
    CRE_SEQ                 numeric                       ,
    IND_SEQ                 numeric                       ,
    NOTE_SEQ                numeric                       ,
    DRUG_SEQ                integer                       ,
    CRE_FEE                 numeric                       
);

%% ============================================================
%%   Table: MANNER_METHOD                                      
%% ============================================================
create table MANNER_METHOD
(
    MANNER                  varchar(30)           not null,
    METHOD                  varchar(50)           not null,
    SPECIFICS               varchar(50)           not null,
    ANSWER                  varchar(50)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (MANNER, METHOD, SPECIFICS, ANSWER)
);

%% ============================================================
%%   Table: CUSTODY                                            
%% ============================================================
create table CUSTODY
(
    CUSTODY_LOCATION        varchar(15)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CUSTODY_LOCATION)
);

%% ============================================================
%%   Table: PHOTO                                              
%% ============================================================
create table PHOTO
(
    PHOTO_SHOT              varchar(20)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (PHOTO_SHOT)
);

%% ============================================================
%%   Table: OTHER_CASE_TYPE                                    
%% ============================================================
create table OTHER_CASE_TYPE
(
    CASE_TYPE               varchar(20)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_TYPE)
);

%% ============================================================
%%   Table: STREET_DIR                                         
%% ============================================================
create table STREET_DIR
(
    STREET_DIR              char(2)               not null,
    DESCRIPTION             char(10)                      ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (STREET_DIR)
);

%% ============================================================
%%   Table: STREET_TYPE                                        
%% ============================================================
create table STREET_TYPE
(
    STREET_TYPE             char(4)               not null,
    DESCRIPTION             char(10)                      ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (STREET_TYPE)
);

%% ============================================================
%%   Table: DIRECTORY_TABLE                                    
%% ============================================================
create table DIRECTORY_TABLE
(
    PHOTO                   varchar(60)                   ,
    MISC                    varchar(60)                   ,
    REPORT                  varchar(60)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     
);

%% ============================================================
%%   Table: RANGE                                              
%% ============================================================
create table RANGE
(
    DRUG_LEVEL              varchar(20)           not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (DRUG_LEVEL)
);

%% ============================================================
%%   Table: SYMBOLS                                            
%% ============================================================
create table SYMBOLS
(
    SYMBOL                  char(1)               not null,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (SYMBOL)
);

%% ============================================================
%%   Table: INVESTIGATION                                      
%% ============================================================
create table INVESTIGATION
(
    CASE_NO                 char(12)              not null,
    INVESTIGATOR            varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    CASE_TYPE               char(3)                       ,
    LAST_NAME               varchar(20)                   ,
    FIRST_NAME              varchar(20)                   ,
    MIDDLE                  varchar(15)                   ,
    NOTIFIED_BY             varchar(18)                   ,
    AGENCY                  varchar(45)                   ,
    NOTIFIER                varchar(40)                   ,
    FUNCTION                varchar(20)                   ,
    NOTIFIER_AREACODE       char(3)                       ,
    NOTIFIER_PHONE          char(8)                       ,
    AGENCY_CASE_NO          varchar(20)                   ,
    NOTIFIED_BY2            varchar(18)                   ,
    AGENCY2                 varchar(45)                   ,
    NOTIFIER2               varchar(40)                   ,
    FUNCTION2               varchar(20)                   ,
    NOTIFIER2_AREACODE      char(3)                       ,
    NOTIFIER2_PHONE         char(8)                       ,
    AGENCY2_CASE_NO         varchar(20)                   ,
    TRANSPORTED_BY          varchar(45)                   ,
    REMOVAL_NOTIFIED_DATE   date                          ,
    REMOVAL_NOTIFIED_TIME   time                          ,
    BLOOD_AVAILABLE         char(1)                       ,
    BLOOD_TRANSPORTED       char(1)                       ,
    CHARTS_AVAILABLE        char(1)                       ,
    CHARTS_TRANSPORTED      char(1)                       ,
    MED_AT_SCENE            char(1)                       ,
    MED_TRANSPORTED         char(1)                       ,
    MED_CUSTODY             char(20)                      ,
    BIRTH_DATE              date                          ,
    AGE_YEAR                integer                       ,
    AGE_MONTH               integer                       ,
    AGE_DAY                 integer                       ,
    ESTIMATED_AGE           varchar(15)                   ,
    RACE                    varchar(10)                   ,
    SEX                     char(1)                       ,
    DEATH_DATE              date                          ,
    DEATH_TIME              time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: TOX_CASES                                          
%% ============================================================
create table TOX_CASES
(
    CASE_NO                 char(12)              not null,
    AGENCY                  varchar(45)                   ,
    AGENCY_CASE_NO          varchar(20)                   ,
    OFFICER                 varchar(40)                   ,
    BADGE_NO                varchar(6)                    ,
    CASE_TYPE               varchar(20)                   ,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    INCIDENT_DATE           date                          ,
    INCIDENT_TIME           time                          ,
    SUSPECT_VICTIM          varchar(7)                    ,
    PRIORITY                char(1)                       ,
    LAST_NAME               varchar(20)                   ,
    FIRST_NAME              varchar(20)                   ,
    MIDDLE                  varchar(15)                   ,
    BIRTH_DATE              date                          ,
    AGE_YEAR                integer                       ,
    RACE                    varchar(10)                   ,
    SEX                     char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: LAB_CONTROL                                        
%% ============================================================
create table LAB_CONTROL
(
    LAB_NO                  char(12)              not null,
    NAME                    varchar(40)                   ,
    PRIORITY                char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO)
);

%% ============================================================
%%   Table: PATHOLOGY                                          
%% ============================================================
create table PATHOLOGY
(
    CASE_NO                 char(12)              not null,
    AUTOPSY_EXT             varchar(8)                    ,
    AUTOPSY_DATE            date                          ,
    AUTOPSY_TIME            time                          ,
    PREGNANCY_3MOS          char(1)                       ,
    PRIORITY                char(1)                       ,
    RECEIVED_BY             varchar(40)                   ,
    PRIMARY_CAUSE           varchar(110)                  ,
    DUE_TO1                 varchar(110)                  ,
    DUE_TO2                 varchar(110)                  ,
    DUE_TO3                 varchar(110)                  ,
    CONTRIBUTORY_CAUSE      varchar(110)                  ,
    MANNER                  varchar(30)                   ,
    INJURY_DESCRIPTION1     varchar(110)                  ,
    NOTE                    long varchar                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: LAB_RECEIVING                                      
%% ============================================================
create table LAB_RECEIVING
(
    LAB_NO                  char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    SPECIMEN_RECEIVED       char(1)                       ,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    RETAIN                  char(1)                       ,
    REQUESTED_BY            varchar(40)                   ,
    REQUESTED_DATE          date                          ,
    RETAINED_BY             char(10)                      ,
    DISPOSED                char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO, SPECIMEN)
);

%% ============================================================
%%   Table: TEST_ASSIGNMENT                                    
%% ============================================================
create table TEST_ASSIGNMENT
(
    LAB_NO                  char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    TEST                    varchar(15)           not null,
    SEND_OUT                char(1)                       ,
    TEST_STATUS             varchar(15)                   ,
    START_TEST              char(1)                       ,
    START_DATE              date                          ,
    START_TIME              time                          ,
    STOP_TEST               char(1)                       ,
    STOP_DATE               date                          ,
    STOP_TIME               time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO, SPECIMEN, TEST)
);

%% ============================================================
%%   Table: MEDICATION                                         
%% ============================================================
create table MEDICATION
(
    CASE_NO                 char(12)              not null,
    DRUG_SEQ                integer               not null,
    DRUG_NAME               varchar(45)                   ,
    PHYSICIAN               varchar(40)                   ,
    PHARMACY                varchar(45)                   ,
    AREACODE                char(3)                       ,
    PHONE                   char(8)                       ,
    RX_NO                   varchar(15)                   ,
    RX_DATE                 date                          ,
    RX_DOSAGE               varchar(30)                   ,
    RX_AMOUNT               integer                       ,
    RX_LEFT                 integer                       ,
    NOTE                    varchar(300)                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, DRUG_SEQ)
);

%% ============================================================
%%   Table: SUPPLEMENTAL                                       
%% ============================================================
create table SUPPLEMENTAL
(
    CASE_NO                 char(12)              not null,
    NOTE_SEQ                integer               not null,
    FROM_NOTE               char(10)                      ,
    TO_NOTE                 char(10)                      ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    NOTE                    long varchar                  ,
    READ_NOTE               char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, NOTE_SEQ)
);

%% ============================================================
%%   Table: FORENSIC                                           
%% ============================================================
create table FORENSIC
(
    CASE_NO                 char(12)              not null,
    PATHOLOGIST             varchar(40)                   ,
    AUTOPSY_EXT             varchar(8)                    ,
    AUTOPSY_DATE            date                          ,
    BLOOD_RECEIVED          char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: HISTOLOGY                                          
%% ============================================================
create table HISTOLOGY
(
    CASE_NO                 char(12)              not null,
    RECEIVED_DATE           date                  not null,
    QUANTITY                integer                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, RECEIVED_DATE)
);

%% ============================================================
%%   Table: PHOTOGRAPHY                                        
%% ============================================================
create table PHOTOGRAPHY
(
    CASE_NO                 char(12)              not null,
    PHOTO_TYPE              varchar(15)           not null,
    PHOTO_SHOT              varchar(20)           not null,
    FILE_NAME               varchar(15)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, PHOTO_TYPE, PHOTO_SHOT)
);

%% ============================================================
%%   Table: SAMPLE                                             
%% ============================================================
create table SAMPLE
(
    CASE_NO                 char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    COLLECTED               char(1)                       ,
    SENT_TO_TOX             char(1)                       ,
    REQ_ANALYSIS            varchar(60)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, SPECIMEN)
);

%% ============================================================
%%   Table: TEST_RESULT                                        
%% ============================================================
create table TEST_RESULT
(
    LAB_NO                  char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    TEST                    varchar(15)           not null,
    DRUG_CLASS              varchar(30)           not null,
    RESULT                  varchar(33)           not null,
    AMOUNT_SIGN             char(1)                       ,
    AMOUNT                  char(10)                      ,
    UNIT                    varchar(8)                    ,
    DRUG_LEVEL              varchar(20)                   ,
    TESTPROC                varchar(18)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO, SPECIMEN, TEST, DRUG_CLASS, RESULT)
);

%% ============================================================
%%   Table: SEND_OUT                                           
%% ============================================================
create table SEND_OUT
(
    LAB_NO                  char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    TEST                    varchar(15)           not null,
    NO_OF_SAMPLES           integer                       ,
    SEND_OUT_DATE           date                          ,
    SEND_OUT_TIME           time                          ,
    EXT_LAB_NAME            varchar(45)                   ,
    EXT_LAB_CONTROL_NO      varchar(20)                   ,
    SENT_BY                 varchar(40)                   ,
    RESULT_RECEIVED         char(1)                       ,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO, SPECIMEN, TEST)
);

%% ============================================================
%%   Table: TOX_SAMPLES                                        
%% ============================================================
create table TOX_SAMPLES
(
    CASE_NO                 char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    QUANTITY                integer                       ,
    COLLECTION_DATE         date                          ,
    COLLECTION_TIME         time                          ,
    SPECIMEN_COMMENT        varchar(60)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, SPECIMEN)
);

%% ============================================================
%%   Table: EVIDENCE_CUSTODY                                   
%% ============================================================
create table EVIDENCE_CUSTODY
(
    CASE_NO                 char(12)              not null,
    ITEM                    varchar(30)           not null,
    AGENCY                  varchar(45)                   ,
    AGENCY_CASE_NO          varchar(20)                   ,
    TRANSPORTED_BY          varchar(45)                   ,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    CUSTODY_LOCATION        varchar(15)                   ,
    SENT_TO_TOX             char(1)                       ,
    RELEASED_BY             varchar(40)                   ,
    RELEASED_TO_AGENCY      varchar(40)                   ,
    RELEASED_TO_PERSON      varchar(40)                   ,
    RELEASED_DATE           date                          ,
    RELEASED_TIME           time                          ,
    AUTHORIZED_BY           varchar(40)                   ,
    AUTHORIZED_DATE         date                          ,
    AUTHORIZED_TIME         time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, ITEM)
);

%% ============================================================
%%   Table: LAB_REVIEW                                         
%% ============================================================
create table LAB_REVIEW
(
    LAB_NO                  char(12)              not null,
    REVIEWED_BY             varchar(40)                   ,
    REVIEWED_DATE           date                          ,
    REVIEWED_TIME           time                          ,
    AMENDED_BY              varchar(40)                   ,
    AMENDED_DATE            date                          ,
    AMENDED_TIME            time                          ,
    PRINT_NOTARY            char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO)
);

%% ============================================================
%%   Table: PROTOCOL                                           
%% ============================================================
create table PROTOCOL
(
    CASE_NO                 char(12)              not null,
    PROTOCOL                long varchar                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: LAB_NOTE                                           
%% ============================================================
create table LAB_NOTE
(
    LAB_NO                  char(12)              not null,
    NOTE_SEQ                integer               not null,
    NOTE                    varchar(1000)                 ,
    SELECTED                char(1)                       ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (LAB_NO, NOTE_SEQ)
);

%% ============================================================
%%   Table: INV_REVIEW                                         
%% ============================================================
create table INV_REVIEW
(
    CASE_NO                 char(12)              not null,
    REVIEWED_BY             varchar(40)                   ,
    REVIEWED_DATE           date                          ,
    REVIEWED_TIME           time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: CLOSED_CASE                                        
%% ============================================================
create table CLOSED_CASE
(
    CASE_NO                 char(12)              not null,
    CLOSED                  char(1)                       ,
    CLOSED_BY               varchar(40)                   ,
    CLOSED_DATE             date                          ,
    CLOSED_TIME             time                          ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: STATISTICS                                         
%% ============================================================
create table STATISTICS
(
    CASE_NO                 char(12)              not null,
    MANNER                  varchar(30)           not null,
    METHOD                  varchar(50)           not null,
    SPECIFICS               varchar(50)           not null,
    ANSWER                  varchar(50)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, MANNER, METHOD, SPECIFICS)
);

%% ============================================================
%%   Table: POLICE                                             
%% ============================================================
create table POLICE
(
    CASE_NO                 char(12)              not null,
    POLICE_HELD             char(7)                       ,
    REQUESTED_BY            varchar(40)                   ,
    REQUESTED_DATE          date                          ,
    RELEASED                char(1)                       ,
    RELEASED_BY             varchar(40)                   ,
    RELEASED_DATE           date                          ,
    NOTE                    varchar(300)                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

%% ============================================================
%%   Table: PATHO_SEND_OUT                                     
%% ============================================================
create table PATHO_SEND_OUT
(
    CASE_NO                 char(12)              not null,
    SPECIMEN                varchar(30)           not null,
    TEST                    varchar(15)           not null,
    SEND_OUT_DATE           date                          ,
    SEND_OUT_TIME           time                          ,
    EXT_LAB_NAME            varchar(45)                   ,
    EXT_LAB_CONTROL_NO      varchar(20)                   ,
    SENT_BY                 varchar(40)                   ,
    RESULT_RECEIVED         char(1)                       ,
    RECEIVED_BY             varchar(40)                   ,
    RECEIVED_DATE           date                          ,
    RECEIVED_TIME           time                          ,
    RESULT                  Varchar(50)                   ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO, SPECIMEN, TEST)
);

%% ============================================================
%%   Table: INVESTIGATION2                                     
%% ============================================================
create table INVESTIGATION2
(
    CASE_NO                 char(12)              not null,
    TRAUMA_HISTORY          char(1)                       ,
    DOCTOR_DENIED           varchar(40)                   ,
    FAX_TO_NOTIFIER         char(1)                       ,
    SOCIAL_SECURITY         char(11)                      ,
    OTHER_ID                varchar(20)                   ,
    STREET_NO               numeric                       ,
    STREET_DIR              char(2)                       ,
    STREET_NAME             char(20)                      ,
    STREET_TYPE             char(4)                       ,
    SUITE_NO                char(5)                       ,
    CITY                    varchar(20)                   ,
    STATE                   char(2)                       ,
    ZIPCODE                 char(5)                       ,
    AREACODE                char(3)                       ,
    PHONE                   char(8)                       ,
    OCCUPATION              varchar(20)                   ,
    ALIAS                   varchar(40)                   ,
    LAST_ALIVE_DATE         date                          ,
    LAST_ALIVE_TIME         time                          ,
    INCIDENT_DATE           date                          ,
    INCIDENT_TIME           time                          ,
    INCIDENT_DAY            varchar(9)                    ,
    INCIDENT_STREET_NO      numeric                       ,
    INCIDENT_STREET_DIR     char(2)                       ,
    INCIDENT_STREET_NAME    char(20)                      ,
    INCIDENT_STREET_TYPE    char(4)                       ,
    INCIDENT_SUITE_NO       char(5)                       ,
    INCIDENT_CITY           varchar(20)                   ,
    INCIDENT_STATE          char(2)                       ,
    PLACE_TYPE              varchar(12)                   ,
    WORK_RELATED            char(1)                       ,
    POLICE_RELATED          char(1)                       ,
    FOUND                   char(1)                       ,
    DEATH_LOCATION          varchar(12)                   ,
    DEATH_STREET_NO         numeric                       ,
    DEATH_STREET_DIR        char(2)                       ,
    DEATH_STREET_NAME       char(20)                      ,
    DEATH_STREET_TYPE       char(4)                       ,
    DEATH_SUITE_NO          char(5)                       ,
    DEATH_CITY              varchar(20)                   ,
    DEATH_COUNTY            varchar(15)                   ,
    DEATH_STATE             char(2)                       ,
    IDENTIFIED_BY           varchar(20)                   ,
    IDENTIFIER              varchar(40)                   ,
    IDENTIFIER_STREET_NO    numeric                       ,
    IDENTIFIER_STREET_DIR   char(2)                       ,
    IDENTIFIER_STREET_NAME  char(20)                      ,
    IDENTIFIER_STREET_TYPE  char(4)                       ,
    IDENTIFIER_SUITE_NO     char(5)                       ,
    IDENTIFIER_CITY         varchar(20)                   ,
    IDENTIFIER_STATE        char(2)                       ,
    IDENTIFIER_AREACODE     char(3)                       ,
    IDENTIFIER_PHONE        char(8)                       ,
    SPECIALTY               varchar(28)                   ,
    PHYSICIAN               varchar(40)                   ,
    PHYSICIAN_AREACODE      char(3)                       ,
    PHYSICIAN_PHONE         char(8)                       ,
    PHYSICIAN_STATE         char(2)                       ,
    WILLING_TO_SIGN         char(1)                       ,
    NOK_NAME                varchar(40)                   ,
    NOK_RELATIONSHIP        varchar(40)                   ,
    NOK_STREET_NO           numeric                       ,
    NOK_STREET_DIR          char(2)                       ,
    NOK_STREET_NAME         char(20)                      ,
    NOK_STREET_TYPE         char(4)                       ,
    NOK_SUITE_NO            char(5)                       ,
    NOK_CITY                varchar(20)                   ,
    NOK_COUNTY              varchar(15)                   ,
    NOK_STATE               char(2)                       ,
    NOK_AREACODE            char(3)                       ,
    NOK_PHONE               char(8)                       ,
    NOK_AREACODE2           char(3)                       ,
    NOK_PHONE2              char(8)                       ,
    NOTE                    long varchar                  ,
    USERID                  char(10)                      ,
    DATETIME_STAMP          timestamp                     ,
    primary key (CASE_NO)
);

alter table PATHOLOGY
    add foreign key FK_PATHOLOG_REF_1028_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table LAB_RECEIVING
    add foreign key FK_LAB_RECE_REF_12143_LAB_CONT (LAB_NO)
       references LAB_CONTROL (LAB_NO) on update restrict on delete restrict;

alter table TEST_ASSIGNMENT
    add foreign key FK_TEST_ASS_REF_1047_LAB_RECE (LAB_NO, SPECIMEN)
       references LAB_RECEIVING (LAB_NO, SPECIMEN) on update restrict on delete restrict;

alter table MEDICATION
    add foreign key FK_MEDICATI_REF_2171_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table SUPPLEMENTAL
    add foreign key FK_SUPPLEME_RELATION__INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table FORENSIC
    add foreign key FK_FORENSIC_REF_1024_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete cascade;

alter table HISTOLOGY
    add foreign key FK_HISTOLOG_RELATION__INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table PHOTOGRAPHY
    add foreign key FK_PHOTOGRA_RELATION__INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table SAMPLE
    add foreign key FK_SAMPLE_PATH_SAMP_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete cascade;

alter table TEST_RESULT
    add foreign key FK_TEST_RES_REF_1054_TEST_ASS (LAB_NO, SPECIMEN, TEST)
       references TEST_ASSIGNMENT (LAB_NO, SPECIMEN, TEST) on update restrict on delete restrict;

alter table SEND_OUT
    add foreign key FK_SEND_OUT_REF_1096_TEST_ASS (LAB_NO, SPECIMEN, TEST)
       references TEST_ASSIGNMENT (LAB_NO, SPECIMEN, TEST) on update restrict on delete restrict;

alter table TOX_SAMPLES
    add foreign key FK_TOX_SAMP_REF_1507_TOX_CASE (CASE_NO)
       references TOX_CASES (CASE_NO) on update restrict on delete restrict;

alter table EVIDENCE_CUSTODY
    add foreign key FK_EVIDENCE_RELATION__INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table LAB_REVIEW
    add foreign key FK_LAB_REVI_REF_12146_LAB_CONT (LAB_NO)
       references LAB_CONTROL (LAB_NO) on update restrict on delete restrict;

alter table PROTOCOL
    add foreign key FK_PROTOCOL_REF_4608_PATHOLOG (CASE_NO)
       references PATHOLOGY (CASE_NO) on update restrict on delete restrict;

alter table LAB_NOTE
    add foreign key FK_LAB_NOTE_REF_12149_LAB_CONT (LAB_NO)
       references LAB_CONTROL (LAB_NO) on update restrict on delete restrict;

alter table INV_REVIEW
    add foreign key FK_INV_REVI_REF_3614_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table CLOSED_CASE
    add foreign key FK_CLOSED_C_REF_5803_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table STATISTICS
    add foreign key FK_STATISTI_REF_6485_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table POLICE
    add foreign key FK_POLICE_REF_9183_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table PATHO_SEND_OUT
    add foreign key FK_PATHO_SE_REF_19627_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

alter table INVESTIGATION2
    add foreign key FK_INVESTIG_REF_20130_INVESTIG (CASE_NO)
       references INVESTIGATION (CASE_NO) on update restrict on delete restrict;

