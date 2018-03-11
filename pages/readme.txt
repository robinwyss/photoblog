Place picture folders here. 

The following name patterns are supported:

- Date prefixed 
    - if the folder starts with a date, the date is extracted and used in the page. The name of
      page will be everything that comes after the data.
    - format: YYYY_MM_DD_NAME (DD is optional), separator can be _,-, space, or none.
    - examples: 20181018_Roadtrip, 201810_Roadtrip, "2018 10 18 Roadtrip", "2018_10_18_Roadtrip"
    - the pages will be sorted in reverse chronological order

- Number prefixed
    - if the folders starts with a number (that is not a date), the numbers will used for sorting,
      the highest number will come first. The page name will be what comes after the number
    - The pages won't have a date in this case
    - format: NN_NAME (where NN is a number), separator can be _,-, space, or none.
    - examples: 1_Roadtrip, 1 Roadtrip, 03-Roadtrip

- No prefix
    - In this case, the oder is in reverse alphabetical order
      
