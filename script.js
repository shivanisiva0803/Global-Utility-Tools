const DateTime = luxon.DateTime;

let fromTimezone = "";
let toTimezone = "";

function countryCodeToFlag(code){

    return code
        .toUpperCase()
        .replace(
            /./g,
            char =>
                String.fromCodePoint(
                    127397 +
                    char.charCodeAt()
                )
        );
}

function formatLocation(item){

    if(!item.city){
        return item.text;
    }

    const flag =
        countryCodeToFlag(
            item.countryCode
        );

    return $(`
        <div class="location-item">

            <div class="location-left">

                <div class="city">
                    ${item.city}
                </div>

                <div class="country">
                    ${item.country}
                </div>

            </div>

            <div class="flag">
                ${flag}
            </div>

        </div>
    `);
}

function formatSelection(item){

    if(!item.city){
        return item.text;
    }

    return `${item.city}, ${item.country}`;
}

/* FROM DROPDOWN */

$('#fromTimezone').select2({

    placeholder:'Search city or country',

    minimumInputLength:2,

    ajax:{

        url:'https://secure.geonames.org/searchJSON',

        dataType:'json',

        delay:300,

        data:function(params){

            return{
                q:params.term,
                maxRows:20,
                username:'YOUR_GEONAMES_USERNAME'
            };
        },

        processResults:function(data){

            return{
                results:data.geonames.map(item=>({

                    id:item.timezone?.timeZoneId ||
                       item.timezone ||

                       "",

                    city:item.name,

                    country:item.countryName,

                    countryCode:item.countryCode,

                    timezone:
                        item.timezone?.timeZoneId ||
                        item.timezone ||

                        ""
                }))
            };
        }
    },

    templateResult:formatLocation,
    templateSelection:formatSelection
});

/* TO DROPDOWN */

$('#toTimezone').select2({

    placeholder:'Search city or country',

    minimumInputLength:2,

    ajax:{

        url:'https://secure.geonames.org/searchJSON',

        dataType:'json',

        delay:300,

        data:function(params){

            return{
                q:params.term,
                maxRows:20,
                username:'YOUR_GEONAMES_USERNAME'
            };
        },

        processResults:function(data){

            return{
                results:data.geonames.map(item=>({

                    id:item.timezone?.timeZoneId ||
                       item.timezone ||

                       "",

                    city:item.name,

                    country:item.countryName,

                    countryCode:item.countryCode,

                    timezone:
                        item.timezone?.timeZoneId ||
                        item.timezone ||

                        ""
                }))
            };
        }
    },

    templateResult:formatLocation,
    templateSelection:formatSelection
});

/* FLATPICKR */

flatpickr("#timeInput",{
    enableTime:true,
    dateFormat:"Y-m-d H:i"
});

/* NOW */

function setNow(){

    document
        .getElementById("timeInput")
        .value =

        DateTime.now()
            .toFormat(
                "yyyy-MM-dd HH:mm"
            );
}

setNow();

/* SELECTED VALUES */

$('#fromTimezone').on(
    'select2:select',
    function(e){

        fromTimezone =
            e.params.data.timezone;

        updateCurrentTime();
    }
);

$('#toTimezone').on(
    'select2:select',
    function(e){

        toTimezone =
            e.params.data.timezone;
    }
);

/* CURRENT TIME */

function updateCurrentTime(){

    if(!fromTimezone) return;

    const now =
        DateTime.now()
            .setZone(fromTimezone)
            .toFormat(
                "cccc, dd LLL yyyy, hh:mm a"
            );

    document
        .getElementById("currentTime")
        .innerHTML =
        `<b>Current time:</b> ${now}`;
}

/* SWAP */

function swapTimezones(){

    const temp = fromTimezone;

    fromTimezone = toTimezone;
    toTimezone = temp;

    const fromText =
        $('#fromTimezone')
        .find(':selected')
        .text();

    const toText =
        $('#toTimezone')
        .find(':selected')
        .text();

    $('#fromTimezone')
        .val($('#toTimezone').val())
        .trigger('change');

    $('#toTimezone')
        .val($('#fromTimezone').val())
        .trigger('change');

    updateCurrentTime();
}

/* CONVERT */

function convertTime(){

    const input =
        document.getElementById(
            "timeInput"
        ).value;

    if(!input){

        alert("Select date/time");
        return;
    }

    if(!fromTimezone ||
       !toTimezone){

        alert(
            "Select From and To locations"
        );

        return;
    }

    const converted =

        DateTime.fromFormat(
            input,
            "yyyy-MM-dd HH:mm",
            {
                zone:fromTimezone
            }
        )

        .setZone(toTimezone)

        .toFormat(
            "cccc, dd LLL yyyy, hh:mm a"
        );

    document
        .getElementById("result")
        .innerHTML =

        `
        <div style="
            color:#777;
            font-size:13px;
        ">
            ${fromTimezone}
            →
            ${toTimezone}
        </div>

        <div style="
            font-size:24px;
            margin-top:10px;
            font-weight:700;
        ">
            ${converted}
        </div>
        `;
}

document.addEventListener(
    "keydown",
    e => {

        if(e.key==="Enter"){
            convertTime();
        }
    }
);
