<script lang="ts">
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectGroup,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { isValid, isValidBBAN, fromBBAN, countries } from 'iban-ts';

type CountryNames = {
  [key: string]: string;
};
export default {
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel,
    SelectGroup,
    Input,
    Label,
    Button,
  },
  data() {
    return {
      selectedCountry: '',
      iban: '',
      validationMessage: '',
      isValid: null,
      countryNames: {
        AF: 'Afghanistan',
        AX: 'Aland Islands',
        AL: 'Albania',
        DZ: 'Algeria',
        AS: 'American Samoa',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguilla',
        AQ: 'Antarctica',
        AG: 'Antigua And Barbuda',
        AR: 'Argentina',
        AM: 'Armenia',
        AW: 'Aruba',
        AU: 'Australia',
        AT: 'Austria',
        AZ: 'Azerbaijan',
        BS: 'Bahamas',
        BH: 'Bahrain',
        BD: 'Bangladesh',
        BB: 'Barbados',
        BY: 'Belarus',
        BE: 'Belgium',
        BZ: 'Belize',
        BJ: 'Benin',
        BM: 'Bermuda',
        BT: 'Bhutan',
        BO: 'Bolivia',
        BA: 'Bosnia And Herzegovina',
        BW: 'Botswana',
        BV: 'Bouvet Island',
        BR: 'Brazil',
        IO: 'British Indian Ocean Territory',
        BN: 'Brunei Darussalam',
        BG: 'Bulgaria',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        KH: 'Cambodia',
        CM: 'Cameroon',
        CA: 'Canada',
        CV: 'Cape Verde',
        KY: 'Cayman Islands',
        CF: 'Central African Republic',
        TD: 'Chad',
        CL: 'Chile',
        CN: 'China',
        CX: 'Christmas Island',
        CC: 'Cocos (Keeling) Islands',
        CO: 'Colombia',
        KM: 'Comoros',
        CG: 'Congo',
        CD: 'Congo, Democratic Republic',
        CK: 'Cook Islands',
        CR: 'Costa Rica',
        CI: "Cote D'Ivoire",
        HR: 'Croatia',
        CU: 'Cuba',
        CY: 'Cyprus',
        CZ: 'Czech Republic',
        DK: 'Denmark',
        DJ: 'Djibouti',
        DM: 'Dominica',
        DO: 'Dominican Republic',
        EC: 'Ecuador',
        EG: 'Egypt',
        SV: 'El Salvador',
        GQ: 'Equatorial Guinea',
        ER: 'Eritrea',
        EE: 'Estonia',
        ET: 'Ethiopia',
        FK: 'Falkland Islands (Malvinas)',
        FO: 'Faroe Islands',
        FJ: 'Fiji',
        FI: 'Finland',
        FR: 'France',
        GF: 'French Guiana',
        PF: 'French Polynesia',
        TF: 'French Southern Territories',
        GA: 'Gabon',
        GM: 'Gambia',
        GE: 'Georgia',
        DE: 'Germany',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GR: 'Greece',
        GL: 'Greenland',
        GD: 'Grenada',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GG: 'Guernsey',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        HM: 'Heard Island & Mcdonald Islands',
        VA: 'Holy See (Vatican City State)',
        HN: 'Honduras',
        HK: 'Hong Kong',
        HU: 'Hungary',
        IS: 'Iceland',
        IN: 'India',
        ID: 'Indonesia',
        IR: 'Iran, Islamic Republic Of',
        IQ: 'Iraq',
        IE: 'Ireland',
        IM: 'Isle Of Man',
        IL: 'Israel',
        IT: 'Italy',
        JM: 'Jamaica',
        JP: 'Japan',
        JE: 'Jersey',
        JO: 'Jordan',
        KZ: 'Kazakhstan',
        KE: 'Kenya',
        KI: 'Kiribati',
        KR: 'Korea',
        KW: 'Kuwait',
        KG: 'Kyrgyzstan',
        LA: "Lao People's Democratic Republic",
        LV: 'Latvia',
        LB: 'Lebanon',
        LS: 'Lesotho',
        LR: 'Liberia',
        LY: 'Libyan Arab Jamahiriya',
        LI: 'Liechtenstein',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        MO: 'Macao',
        MK: 'Macedonia',
        MG: 'Madagascar',
        MW: 'Malawi',
        MY: 'Malaysia',
        MV: 'Maldives',
        ML: 'Mali',
        MT: 'Malta',
        MH: 'Marshall Islands',
        MQ: 'Martinique',
        MR: 'Mauritania',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'Mexico',
        FM: 'Micronesia, Federated States Of',
        MD: 'Moldova',
        MC: 'Monaco',
        MN: 'Mongolia',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MA: 'Morocco',
        MZ: 'Mozambique',
        MM: 'Myanmar',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NL: 'Netherlands',
        AN: 'Netherlands Antilles',
        NC: 'New Caledonia',
        NZ: 'New Zealand',
        NI: 'Nicaragua',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        NF: 'Norfolk Island',
        MP: 'Northern Mariana Islands',
        NO: 'Norway',
        OM: 'Oman',
        PK: 'Pakistan',
        PW: 'Palau',
        PS: 'Palestinian Territory, Occupied',
        PA: 'Panama',
        PG: 'Papua New Guinea',
        PY: 'Paraguay',
        PE: 'Peru',
        PH: 'Philippines',
        PN: 'Pitcairn',
        PL: 'Poland',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        QA: 'Qatar',
        RE: 'Reunion',
        RO: 'Romania',
        RU: 'Russian Federation',
        RW: 'Rwanda',
        BL: 'Saint Barthelemy',
        SH: 'Saint Helena',
        KN: 'Saint Kitts And Nevis',
        LC: 'Saint Lucia',
        MF: 'Saint Martin',
        PM: 'Saint Pierre And Miquelon',
        VC: 'Saint Vincent And Grenadines',
        WS: 'Samoa',
        SM: 'San Marino',
        ST: 'Sao Tome And Principe',
        SA: 'Saudi Arabia',
        SN: 'Senegal',
        RS: 'Serbia',
        SC: 'Seychelles',
        SL: 'Sierra Leone',
        SG: 'Singapore',
        SK: 'Slovakia',
        SI: 'Slovenia',
        SB: 'Solomon Islands',
        SO: 'Somalia',
        ZA: 'South Africa',
        GS: 'South Georgia And Sandwich Isl.',
        ES: 'Spain',
        LK: 'Sri Lanka',
        SD: 'Sudan',
        SR: 'Suriname',
        SJ: 'Svalbard And Jan Mayen',
        SZ: 'Swaziland',
        SE: 'Sweden',
        CH: 'Switzerland',
        SY: 'Syrian Arab Republic',
        TW: 'Taiwan',
        TJ: 'Tajikistan',
        TZ: 'Tanzania',
        TH: 'Thailand',
        TL: 'Timor-Leste',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad And Tobago',
        TN: 'Tunisia',
        TR: 'Turkey',
        TM: 'Turkmenistan',
        TC: 'Turks And Caicos Islands',
        TV: 'Tuvalu',
        UG: 'Uganda',
        UA: 'Ukraine',
        AE: 'United Arab Emirates',
        GB: 'United Kingdom',
        US: 'United States',
        UM: 'United States Outlying Islands',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VU: 'Vanuatu',
        VE: 'Venezuela',
        VN: 'Viet Nam',
        VG: 'Virgin Islands, British',
        VI: 'Virgin Islands, U.S.',
        WF: 'Wallis And Futuna',
        EH: 'Western Sahara',
        YE: 'Yemen',
        ZM: 'Zambia',
        ZW: 'Zimbabwe',
      } as CountryNames,
    };
  },
  methods: {
    resetIsValid() {
      this.isValid = null;
    },
    validate() {
      if (this.isPotentialIBAN) {
        this.isValid = isValid(this.iban);
      } else if (this.isLikelyBBAN) {
        this.isValid = isValidBBAN(this.selectedCountry, this.iban);
      } else {
        this.isValid = null;
      }
    },
    fromBBAN() {
      return fromBBAN(this.selectedCountry, this.iban);
    },
  },
  computed: {
    canBeValidated(): boolean {
      return this.iban.length > 2 && (this.isPotentialIBAN || this.selectedCountry.length > 0);
    },
    isPotentialIBAN(): boolean {
      const countryCode = this.iban.substring(0, 2).toUpperCase();
      return this.iban.length > 2 && !!countries[countryCode];
    },
    isLikelyBBAN(): boolean {
      return this.iban.length > 2 && !this.isPotentialIBAN;
    },
  },
};
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Card class="w-[450px]">
      <CardHeader>
        <CardTitle>IBAN Validation</CardTitle>
        <CardDescription>Select country and enter IBAN for validation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-8">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select v-model="selectedCountry">
            <SelectTrigger aria-label="Country">
              <SelectValue>{{ selectedCountry ? countryNames[selectedCountry] : 'Select Country' }}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className="overflow-y-auto max-h-[20rem]">
                <SelectLabel>Select country</SelectLabel>
                <SelectItem v-for="(name, code) in countryNames" :key="code" :value="code.toString()">{{ name }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input id="iban" v-model="iban" placeholder="Enter your IBAN" />
        </div>
      </CardContent>
      <CardFooter class="flex justify-end px-6 pb-4">
        <Button @click="validate">Check Validity</Button>
      </CardFooter>
      <CardContent className="mt-2 space-y-2 p-8">
        <CardDescription class="text-gray-600">
          <div v-if="isValid !== null">
            <div v-if="isValid">
              <p>This {{ isPotentialIBAN ? 'IBAN' : 'BBAN' }} is valid.</p>
              <p v-if="isLikelyBBAN">The corresponding IBAN is {{ fromBBAN() }}.</p>
            </div>
            <p v-else>This {{ isPotentialIBAN ? 'IBAN' : 'BBAN' }} is invalid.</p>
          </div>
          <div v-else>Validation pending or input not provided.</div>
        </CardDescription>
      </CardContent>
    </Card>
  </div>
</template>
