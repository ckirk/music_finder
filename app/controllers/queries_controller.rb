class QueriesController < ApplicationController
  def new
  end

  # def create
  # 	#render plain: params[:query].inspect
  # 	@query = Query.new(query_params)

  # 	#@query.save
  # 	#redirect_to @query

  # 	respond_to do |format|
	 #    if @query.save
	 #      format.html { 
  #         #redirect_to @query, notice: 'Query was successfully created.' 
  #         render plain: params[:query].inspect
  #       }
	 #      format.js   {}
	 #      format.json { render json: @query, status: :created, location: @query }
	 #    else
	 #      format.html { render action: "new" }
	 #      format.json { render json: @query.errors, status: :unprocessable_entity }
	 #    end
  # 	end
  # end

  def create
    #render :json => params[:trainingSet]

    # convert json to ruby hash
    training_set = JSON.parse(params[:trainingSet])

    # break out qury and results
    query = training_set[0]
    results = training_set[1]

    #binding.pry

    # access individual values
    # query["artist"]
    # query["track"]
    # query["duration"]

    # save values to db
    @query = Query.new(
      artist: query["artist"],
      track: query["track"],
      duration: query["duration"]
    )

    if @query.save

      results.each do |result|
        @result = Result.new(
          title: result["title"],
          date_published: result["datePublished"],
          duration: result["duration"],
          view_count: result["viewCount"],
          like_count: result["likeCount"],
          order: result["resultOrder"],
          description: result["description"],
          match: result["match"],
          query_id: @query.id
          #category: results["categoryId"],
          #results["matchScore"]
        )
        unless @result.save
          render :json => { response: "failed to save result" }, :status => 500
        end
      end

      render :json => { response: "ok", params: params[:trainingSet] }

    else
      render :json => { response: "failed to save query" }, :status => 500
    end


    # @query_result = QueryResult.new(
    #   query_id: @query.id,
    #   result_id: @result.id,
    #   match: results["match"]
    # )

    # @query = Query.new(query_params)
    # if @query.save
    #   render :json => params[:query]
    # else
    #   render :json => {}, :status => 500
    # end

    # respond_to do |format|
    #   #format.html
    #   format.json { render :json => @query }
    # end
    # if @query.save
    #   render :json => { params[:query] } # send back any data if necessary
    # else
    #   render :json => { no_dice }, :status => 500
    # end
  end

  def show
  	@query = Query.find(params[:id])
  end

  def index
  	@queries = Query.all
    @results = Result.all
  end

  private
    def query_params
      params.require(:query).permit(:query, :artist, :track, :duration, :date_published)
    end
end