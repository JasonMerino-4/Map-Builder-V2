# Map-Builder-V2
The problem: Finding rooms in a multifloor large building is tedious.
Solution: Using building floorplans, let the user input a room number and change the img src to the according floorplan and highlight the room.

How do we create this functionallity?

Use \<map> and \<area> html elements and use any of the online Image Map tools.
Issues with this: No built in scaling/responsiveness
                  Messy HTML
                  All /<area> elements will need to load, we only need the user room number input to load

Alternatively:
  Recreate \<map> \<area> functionality using \<div> \<img> and css:
  
    Nest an img inside a container div and set the div's position attribute to relative. That container will function as the \<map>
    Next nest a \<div> within that container div from before. We'll use this div as a node to define a room number's area on the map.
    To do so this node div's css position attribute must be absolute. This \<div> node can now be used like an \<area> element by
    positioning the div using the top: and left: attributes
    


    

      

  
  

  
