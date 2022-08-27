const advancedResults=(model,populate)=>async (req,res,next)=>{
    let query;

    //Copy req.Query 
    const reqQuery={...req.query};
    
    //Fields to exclude => {{URL}}/api/v1/bootcamps?select=name,description
    const removeFields=["select","sort","page","limit"];

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param=>{ delete reqQuery[param]});


    //Create query string
    let queryStr=JSON.stringify(reqQuery);
    //{{URL}}/api/v1/bootcamps?careers[in]=Web Development

        //Create operators ($gt,gte,etc)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
        
        //Finding resource
        query=model.find(JSON.parse(queryStr));
        // .populate({
        //     path:"courses",
        //     select:"title"
        // });

        //SELECT Fields
        if(req.query.select){
            const fields=req.query.select.split(",").join(" ");
            query=query.select(fields);
        }

        //sort Fields => {{URL}}/api/v1/bootcamps?sort=-name
        if(req.query.sort){
            const sortBy=req.query.sort.split(",").join(" ");
            query=query.sort(sortBy);
        }else{
            query=query.sort("-createdAt");
        }

        //Pagination => {{URL}}/api/v1/bootcamps?limit=2&page=2
        const page=parseInt(req.query.page,10)||1;
        const limit=parseInt(req.query.limit,10)||100;
        const startIndex=(page-1)*limit; 
        const endIndex=page*limit;
        const total=await model.countDocuments();

        query=query.skip(startIndex).limit(limit);


        if(populate){
            query=query.populate(populate);
        }


        //Executing query
        const results=await query;

        //pagination result
         const pagination={};

         if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
         }

         if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
         }

         res.advancedResults={
            success:true,
            count:results.length,
            pagination,
            data:results
         }
    next();
}
 
module.exports=advancedResults;