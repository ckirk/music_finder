class QueriesController < ApplicationController
  def new
  end

  def create
  	#render plain: params[:query].inspect
  	@query = Query.new(query_params)

  	#@query.save
  	#redirect_to @query

  	respond_to do |format|
	    if @query.save
	      format.html { 
          #redirect_to @query, notice: 'Query was successfully created.' 
          render plain: params[:query].inspect
        }
	      format.js   {}
	      format.json { render json: @query, status: :created, location: @query }
	    else
	      format.html { render action: "new" }
	      format.json { render json: @query.errors, status: :unprocessable_entity }
	    end
  	end
  end

  def show
  	@query = Query.find(params[:id])
  end

  def index
  	@queries = Query.all
  end

  private
    def query_params
      params.require(:query).permit(:query, :artist, :track, :duration, :date_published)
    end
end